import { addDoc, collection, query, where } from 'firebase/firestore';
import { db } from '../../Services/firebase';
import { getDocs } from 'firebase/firestore';

export const sendNotificationToOwners = async (eventId, eventTitle) => {
  try {
    // Tìm tất cả các user có role là "owner"
    const usersCollectionRef = collection(db, "Users");
    const q = query(usersCollectionRef, where("role", "==", "owner"));
    const querySnapshot = await getDocs(q);

    const notificationsCollectionRef = collection(db, "notifications");

    // Gửi thông báo cho từng owner
    querySnapshot.forEach(async (doc) => {
      const ownerData = doc.data();
      const ownerId = doc.id; // Lấy ID của document từ Firestore

      await addDoc(notificationsCollectionRef, {
        userId: ownerId, // Sử dụng document ID làm userId
        content: `New event "${eventTitle}" has been posted. Click to view the details.`,
        eventId: eventId, // Tham chiếu tới sự kiện mới tạo
        isRead: false, // Đánh dấu thông báo là chưa đọc
        createdAt: new Date(),
      });
    });

    console.log("Notifications sent to all owners");
  } catch (error) {
    console.error("Error sending notifications to owners: ", error);
  }
};
