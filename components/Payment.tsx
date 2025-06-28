import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  // Check environment variables
  useEffect(() => {
    const stripeKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log("Stripe publishable key exists:", !!stripeKey);
    console.log("Stripe key starts with:", stripeKey?.substring(0, 10) + "...");
    
    if (!stripeKey) {
      console.error("Stripe publishable key is missing!");
    }
  }, []);

  const openPaymentSheet = async () => {
    console.log("Opening payment sheet...");
    console.log("Payment amount:", amount);
    console.log("User email:", email);
    
    try {
      await initializePaymentSheet();
      console.log("Payment sheet initialized successfully, presenting...");

      const { error } = await presentPaymentSheet();

      if (error) {
        console.error("Payment sheet error details:", {
          code: error.code,
          message: error.message,
          localizedMessage: error.localizedMessage,
          declineCode: error.declineCode,
          stripeErrorCode: error.stripeErrorCode,
          type: error.type
        });
        
        if (error.code === "Canceled") {
          console.log("Payment was canceled by user or due to configuration issue");
          Alert.alert(
            "Payment Canceled", 
            "The payment was canceled. This might be due to:\n\n" +
            "• No payment methods available\n" +
            "• Google Pay not properly configured\n" +
            "• Testing on simulator (use physical device)\n\n" +
            "Please try again or check your payment setup."
          );
        } else {
          Alert.alert(`Payment Error: ${error.code}`, error.message);
        }
      } else {
        console.log("Payment completed successfully");
        setSuccess(true);
      }
    } catch (error) {
      console.error("Unexpected error in payment flow:", error);
      Alert.alert("Unexpected Error", "An unexpected error occurred during payment.");
    }
  };

  const initializePaymentSheet = async () => {
    try {
      console.log("Initializing payment sheet with amount:", amount);
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Wizer Ride",
        intentConfiguration: {
          mode: {
            amount: parseInt(amount) * 100,
            currencyCode: "usd",
          },
          paymentMethodTypes: ["card", "link", "amazon_pay", "google_pay"],
          confirmHandler: async (
            paymentMethod,
            shouldSavePaymentMethod,
            intentCreationCallback,
          ) => {
            try {
              console.log("Payment method selected:", paymentMethod.id);
              
              const { paymentIntent, customer } = await fetchAPI(
                "/(api)/(stripe)/create",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: fullName || email.split("@")[0],
                    email: email,
                    amount: amount,
                    paymentMethodId: paymentMethod.id,
                  }),
                },
              );

              if (paymentIntent.client_secret) {
                const { result } = await fetchAPI("/(api)/(stripe)/pay", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    payment_intent_id: paymentIntent.id,
                    customer_id: customer,
                    client_secret: paymentIntent.client_secret,
                  }),
                });

                if (result.client_secret) {
                  await fetchAPI("/(api)/ride/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      origin_address: userAddress,
                      destination_address: destinationAddress,
                      origin_latitude: userLatitude,
                      origin_longitude: userLongitude,
                      destination_latitude: destinationLatitude,
                      destination_longitude: destinationLongitude,
                      ride_time: rideTime.toFixed(0),
                      fare_price: parseInt(amount) * 100,
                      payment_status: "paid",
                      driver_id: driverId,
                      user_id: userId,
                    }),
                  });

                  intentCreationCallback({
                    clientSecret: result.client_secret,
                  });
                }
              }
            } catch (error) {
              console.error("Payment processing error:", error);
              Alert.alert("Payment Error", "Failed to process payment. Please try again.");
              throw error;
            }
          },
        },
        returnURL: "myapp://book-ride",
      });

      if (error) {
        console.error("Payment sheet initialization error:", error);
        Alert.alert("Payment Error", "Failed to initialize payment. Please try again.");
      } else {
        console.log("Payment sheet initialized successfully");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      Alert.alert("Payment Error", "Failed to initialize payment system. Please try again.");
    }
  };

  const testPaymentSheet = async () => {
    console.log("Testing payment sheet with minimal configuration...");
    
    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Wizer Ride",
        intentConfiguration: {
          mode: {
            amount: 1000, // $10.00
            currencyCode: "usd",
          },
          paymentMethodTypes: ["card"], // Start with just card to test
          confirmHandler: async (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
            console.log("Test payment method selected:", paymentMethod.id);
            // For testing, just return a mock client secret
            intentCreationCallback({
              clientSecret: "pi_test_secret_123",
            });
          },
        },
        returnURL: "myapp://book-ride",
      });

      if (error) {
        console.error("Test payment sheet error:", error);
        Alert.alert("Test Error", `Payment sheet test failed: ${error.message}`);
      } else {
        console.log("Test payment sheet initialized successfully");
        Alert.alert("Test Success", "Payment sheet initialized successfully with card payment only.");
      }
    } catch (error) {
      console.error("Test payment sheet exception:", error);
      Alert.alert("Test Exception", "An exception occurred during payment sheet test.");
    }
  };

  return (
    <>
      <View className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Text className="text-sm font-JakartaBold text-blue-800 mb-2">
          Payment Debug Info:
        </Text>
        <Text className="text-xs font-JakartaMedium text-blue-700">
          Amount: ${amount}
        </Text>
        <Text className="text-xs font-JakartaMedium text-blue-700">
          Email: {email}
        </Text>
        <Text className="text-xs font-JakartaMedium text-blue-700">
          Merchant: Wizer Ride
        </Text>
        <Text className="text-xs font-JakartaMedium text-blue-700">
          Methods: Card, Link, Amazon Pay, Google Pay
        </Text>
      </View>
      
      <CustomButton
        title="Test Payment Sheet (Card Only)"
        className="mb-4"
        onPress={testPaymentSheet}
        bgVariant="secondary"
      />
      
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;