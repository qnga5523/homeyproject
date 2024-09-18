import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

import { Card, Spin, Typography, Image, Button, Modal, message } from "antd";
import { db } from "../../Services/firebase";

const { Title, Paragraph } = Typography;

export default function DetailEvent() {
  const { id } = useParams(); // Get the event ID from the route parameters
  const navigate = useNavigate(); // Navigate programmatically
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = doc(db, "events", id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          setEvent(eventSnapshot.data());
        } else {
          console.log("No such event!");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "events", id));
      message.success("Event deleted successfully!");
      navigate("/"); // Navigate back to the events list after deletion
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
    navigate(`/edit-event/${id}`); // Navigate to the edit page
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <Card
      style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}
      cover={event.imageUrl && <Image alt={event.title} src={event.imageUrl} />}
      actions={[
        <Button type="primary" onClick={handleEdit}>
          Edit
        </Button>,
        <Button type="danger" onClick={showDeleteConfirm}>
          Delete
        </Button>,
      ]}
    >
      <Title level={2}>{event.title}</Title>
      <Paragraph>
        <strong>Mode:</strong> {event.mode}
      </Paragraph>
      <Paragraph>
        <strong>Goal:</strong> {event.goal}
      </Paragraph>
      <Paragraph>
        <strong>Number of Participants:</strong> {event.number}
      </Paragraph>
      <Paragraph>
        <strong>Content:</strong> {event.content}
      </Paragraph>
      <Paragraph>
        <strong>Post Date:</strong>{" "}
        {event.postDate?.toDate().toLocaleDateString()}
      </Paragraph>
      {event.deadline && (
        <Paragraph>
          <strong>Deadline:</strong>{" "}
          {event.deadline
            .map((date) => date.toDate().toLocaleDateString())
            .join(" - ")}
        </Paragraph>
      )}
      <Paragraph>
        <strong>Author:</strong> {event.author.name}
      </Paragraph>
    </Card>
  );
}
