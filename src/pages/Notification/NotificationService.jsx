import { addDoc, collection, serverTimestamp, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../Services/firebase';
import { message } from 'antd';

/**
 * @param {string|null} userId 
 * @param {string} role 
 * @param {string} content
 * @param {string|null} relatedId  
 */
export const sendNotification = async (userId, role, content, relatedId  = null) => {
  try {
    const notificationsCollectionRef = collection(db, "notifications");
    await addDoc(notificationsCollectionRef, {
      userId: role === 'user' ? userId : null, 
      role,
      content,
      relatedId ,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    console.log(`Notification sent to ${role} ${userId ? userId : ''}: ${content}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

/**
 * @param {string} bookingId  
 * @param {string} userId 
 * @param {string} newStatus 
 */
export const handleUpdateBookingStatus = async (bookingId, userId, newStatus) => {
  try {
    const bookingRef = doc(db, 'serviceBookings', bookingId);
    await updateDoc(bookingRef, { status: newStatus });
    await sendNotification(
      userId,
      'user',
      `Your booking has been updated to "${newStatus}". Click to view details.`,
      bookingId
    );
    await sendNotification(
      null,
      'admin',
      `Booking request with ID ${bookingId} has been updated to "${newStatus}".`,
      bookingId
    );

    message.success('Booking status updated and notifications sent to both user and admin.');
  } catch (error) {
    message.error('Failed to update booking status.');
    console.error("Error updating booking status:", error);
  }
};

/**
 * @param {string} vehicleId  
 * @param {string} userId 
 * @param {string} newStatus 
 */
export const handleUpdateVehicleStatus = async (vehicleId, userId, newStatus) => {
  try {
    const vehicleRef = doc(db, 'Vehicle', vehicleId);
    await updateDoc(vehicleRef, { status: newStatus });
    await sendNotification(
      userId,
      'user',
      `Your vehicle registration has been updated to "${newStatus}". Click to view details.`,
      vehicleId
    );
    await sendNotification(
      null,
      'admin',
      `Vehicle registration request with ID ${vehicleId} has been updated to "${newStatus}".`,
      vehicleId
    );

    message.success('Vehicle registration status updated and notifications sent to both user and admin.');
  } catch (error) {
    message.error('Failed to update vehicle registration status.');
    console.error("Error updating vehicle registration status:", error);
  }
};
/**
 * @param {string} eventId  
 * @param {string} eventTitle
 */
export const sendNotificationToOwners = async (eventId, eventTitle) => {
  try {
    const usersCollectionRef = collection(db, "Users");
    const q = query(usersCollectionRef, where("role", "==", "owner"));
    const querySnapshot = await getDocs(q);

    const notificationsCollectionRef = collection(db, "notifications");

    querySnapshot.forEach(async (doc) => {
      const ownerId = doc.id;

      await addDoc(notificationsCollectionRef, {
        userId: ownerId,
        content: `New event "${eventTitle}" has been posted. Click to view the details.`,
        eventId: eventId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });

    console.log("Notifications sent to all owners");
  } catch (error) {
    console.error("Error sending notifications to owners: ", error);
  }
};
