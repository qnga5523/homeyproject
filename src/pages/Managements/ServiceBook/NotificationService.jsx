import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import { message } from 'antd';

/**
 * @param {string|null} userId 
 * @param {string} role 
 * @param {string} content
 * @param {string|null} bookingId 
 */
export const sendNotification = async (userId, role, content, bookingId = null) => {
  try {
    const notificationsCollectionRef = collection(db, "notifications");
    await addDoc(notificationsCollectionRef, {
      userId: role === 'user' ? userId : null, 
      role,
      content,
      bookingId,
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

    message.success('Booking status updated and notification sent to user');
  } catch (error) {
    message.error('Failed to update booking status');
    console.error("Error updating booking status:", error);
  }
};
