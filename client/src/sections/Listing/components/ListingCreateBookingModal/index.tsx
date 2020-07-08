import React, { useState } from "react";
import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Modal, Typography } from "antd";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import moment, { Moment } from "moment";
import { CREATE_BOOKING, CHARGE_BOOKING } from "../../../../lib/graphql/mutations";
import {
  CreateBooking as CreateBookingData,
  CreateBookingVariables,
} from "../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking";
import {
  ChargeBooking as ChargeBookingData,
  ChargeBookingVariables
} from "../../../../lib/graphql/mutations/CreateBooking/__generated__/ChargeBooking";
import { KeyOutlined } from "@ant-design/icons";
import { formatListingPrice, displaySuccessNotification, displayErrorMessage } from "../../../../lib/utils";

interface Props {
  id: string;
  price: number;
  modalVisible: boolean;
  checkInDate: Moment;
  checkOutDate: Moment;
  setModalVisible: (modalVisible: boolean) => void;
  clearBookingData: () => void;
  handleListingRefetch: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({
  id,
  price,
  modalVisible,
  checkInDate,
  checkOutDate,
  setModalVisible,
  clearBookingData,
  handleListingRefetch
}: Props) => {
  const stripe = useStripe()!;
  const elements = useElements()!;
  const cardElement = elements.getElement(CardElement)!;
  const [loading, setLoading] = useState<boolean>(false);

  const [clientSecret] = useMutation<
    ChargeBookingData,
    ChargeBookingVariables
  >(CHARGE_BOOKING, {
    onCompleted: async ({ clientSecret }) => {
      const { paymentIntent, error } = await stripe.confirmCardPayment(`${clientSecret.secret}`, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setLoading(false);
        displayErrorMessage(
          error && error.message
            ? error.message
            : "Sorry! We weren't able to book the listing. Please try again later."
        );
      }

      if (paymentIntent?.status === "succeeded") {
        createBooking({
          variables: {
            input: {
              id,
              source: "unused",
              checkIn: moment(checkInDate).format("YYYY-MM-DD"),
              checkOut: moment(checkOutDate).format("YYYY-MM-DD")
            }
          }
        });
      }
    },
    onError: () => {
      setLoading(false);
      displayErrorMessage("Sorry! We weren't able to initialize your Stripe account. Please try again later.")
    }
  })

  const [createBooking] = useMutation<
    CreateBookingData,
    CreateBookingVariables
  >(CREATE_BOOKING, {
    onCompleted: async () => {
      setLoading(false);
      clearBookingData();
      displaySuccessNotification(
        "You've successfully booked the listing!",
        "Booking history can always be found in your Profile page."
      );
      handleListingRefetch();
    },
    onError: () => {
      setLoading(false);
      displayErrorMessage("Sorry! We weren't able to book the listing. Please try again later.")
    },
  });

  const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
  const listingPrice = price * daysBooked;

  const handleCreateBooking = async () => {

    if (!stripe || !elements) {
      return displayErrorMessage("Sorry! We weren't able to connect with Stripe");
    }
    setLoading(true);

    clientSecret({
      variables: {
        input: {
          id,
          checkIn: moment(checkInDate).format("YYYY-MM-DD"),
          checkOut: moment(checkOutDate).format("YYYY-MM-DD")
        }
      }
    });
  }

  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-boooking-modal__intro-title">
            <KeyOutlined />
          </Title>
          <Title level={3} className="listing-boooking-modal__intro-title">
            Book your trip
          </Title>
          <Paragraph>
            Enter your payment information to book the listing from the dates between{" "}
            <Text mark strong>
              {moment(checkInDate).format("MMMM Do YYYY")}
            </Text>{" "}
            and{" "}
            <Text mark strong>
              {moment(checkOutDate).format("MMMM Do YYYY")}
            </Text>
            , inclusive.
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatListingPrice(price, false)} * {daysBooked} days ={" "}
            <Text strong>{formatListingPrice(listingPrice, false)}</Text>
          </Paragraph>
          <Paragraph className="listing-booking-modal__charge-summary-total">
            Total = <Text mark>{formatListingPrice(listingPrice, false)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement options={{ hidePostalCode: true }} className="listing-booking-modal__stripe-card" />
          <Button
            size="large"
            type="primary"
            className="listing-booking-modal__cta"
            loading={loading}
            onClick={handleCreateBooking}>
            Book
          </Button>
        </div>
      </div>
    </Modal>
  );
};
