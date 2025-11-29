def get_new_offer_message(offer_title: str = "New Offer"):
    return f"New surplus food offer available: {offer_title}"

def get_reservation_confirmation_message(order_id: int):
    return f"Your reservation #{order_id} has been confirmed! Check your QR code for pickup."

def get_expiration_reminder_message(offer_title: str = "Offer"):
    return f"Reminder: {offer_title} is expiring soon. Don't miss out!"

def get_pickup_reminder_message(order_id: int):
    return f"Reminder: Your order #{order_id} is ready for pickup!"