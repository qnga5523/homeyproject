import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { Card, Spin, Typography, Image, Button, Modal, message } from "antd";
import { db, auth } from "../../Services/firebase"; 
import { NotFound } from "../../components/common/NotFound";

const { Title, Paragraph } = Typography;

export default function DetailEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventNotFound, setEventNotFound] = useState(false);
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = doc(db, "events", id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          setEvent(eventSnapshot.data());
        } else {
          setEventNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkAdminRole = async () => {
      if (auth.currentUser) {
        const userDoc = doc(db, "Users", auth.currentUser.uid); 
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists() && userSnapshot.data().role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    fetchEvent();
    checkAdminRole();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "events", id));
      message.success("Event deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting event: ", error);
      message.error("Failed to delete event");
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this event?",
      content: "This action cannot be undone.",
      onOk: handleDelete,
      okText: "Yes",
      cancelText: "No",
    });
  };

  const handleEdit = () => {
    navigate(`/edit-event/${id}`);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (eventNotFound) {
    return <NotFound />;
  }

  return (
    <Card
      style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}
      cover={event.imageUrl && <Image alt={event.title} src={event.imageUrl} />}
      actions={
        isAdmin
          ? [
              <Button type="primary" onClick={handleEdit}>
                Edit
              </Button>,
              <Button type="danger" onClick={showDeleteConfirm}>
                Delete
              </Button>,
            ]
          : []
      }
    >
      <Title level={2}>{event.title}</Title>
      <Paragraph>
        <strong>Requirement:</strong> {event.req}
      </Paragraph>
      <Paragraph>
        <strong>Goal:</strong> {event.goal}
      </Paragraph>
      <Paragraph>
        <strong>Content:</strong> {event.content}
      </Paragraph>
      <Paragraph>
        <strong>Post Date:</strong>{" "}
        {event.postDate?.toDate().toLocaleDateString()}
      </Paragraph>
      <Paragraph>
        <strong>Author:</strong> {event.author.name}
      </Paragraph>
    </Card>
  );
}
