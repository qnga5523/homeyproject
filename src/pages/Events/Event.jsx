import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { PlusOutlined } from "@ant-design/icons";
import { Card, Row, Col, Button, Typography } from "antd";
import {auth, db } from "../../Services/firebase";
import { useNavigate } from "react-router-dom";
const { Title, Paragraph } = Typography;

const categories = [
  "Community Events",
  "Sports Activities",
  "Children's Programs",
  "Utility Services",
  "Classes and Workshops",
  "Charity Programs",
  "Fairs and Exhibitions",
];

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "events");
        const snapshot = await getDocs(eventsCollection);
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
        setFilteredEvents(eventsData); 
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userDoc = doc(db, "Users", auth.currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setUserRole(userSnapshot.data().role); 
        }
      }
    };

    fetchEvents();
    fetchUserRole();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (category === "") {
      setFilteredEvents(events); 
    } else {
      setFilteredEvents(events.filter((event) => event.req === category));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Events</Title>
      {userRole === "admin" && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/CreateEvent")}
          style={{ marginBottom: "20px" }}
        >
          Create Event
        </Button>
      )}
      {/* Category Filter */}
      <div style={{ marginBottom: "20px" }}>
        <Button
          type={selectedCategory === "" ? "primary" : "default"}
          onClick={() => handleCategoryClick("")}
          style={{ marginRight: "10px" }}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            type={selectedCategory === category ? "primary" : "default"}
            onClick={() => handleCategoryClick(category)}
            style={{ marginRight: "10px", marginBottom: "10px" }}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Events List */}
      <Row gutter={[16, 16]}>
        {filteredEvents.map((event) => (
          <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={event.title}
                  src={event.imageUrl}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
            >
              <Title level={4}>{event.title}</Title>
              <Paragraph>{event.content.slice(0, 100)}...</Paragraph>
              <Button
                type="link"
                href={`/${userRole}/event/${event.id}`} 
              >
                Read More
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
