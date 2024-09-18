import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { List, Card, Tabs, Button } from "antd";
import { Link } from "react-router-dom";
import { db } from "../../Services/firebase";

const { TabPane } = Tabs;

export default function Event() {
  const [publicEvents, setPublicEvents] = useState([]);
  const [privateEvents, setPrivateEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch public events
        const publicQuery = query(
          collection(db, "events"),
          where("mode", "==", "public")
        );
        const publicSnapshot = await getDocs(publicQuery);
        const publicData = publicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPublicEvents(publicData);

        // Fetch private events
        const privateQuery = query(
          collection(db, "events"),
          where("mode", "==", "private")
        );
        const privateSnapshot = await getDocs(privateQuery);
        const privateData = privateSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPrivateEvents(privateData);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Public Events" key="1">
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={publicEvents}
          renderItem={(event) => (
            <List.Item>
              <Card
                title={event.title}
                cover={<img alt={event.title} src={event.imageUrl} />}
                actions={[
                  <Link to={`/event/${event.id}`}>
                    <Button type="link">View Details</Button>
                  </Link>,
                ]}
              >
                <p>{event.content}</p>
                <p>
                  <strong>Goal:</strong> {event.goal}
                </p>
                <p>
                  <strong>Number of Participants:</strong> {event.number}
                </p>
              </Card>
            </List.Item>
          )}
        />
      </TabPane>
      <TabPane tab="Private Events" key="2">
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={privateEvents}
          renderItem={(event) => (
            <List.Item>
              <Card
                title={event.title}
                cover={<img alt={event.title} src={event.imageUrl} />}
                actions={[
                  <Link to={`/event/${event.id}`}>
                    <Button type="link">View Details</Button>
                  </Link>,
                ]}
              >
                <p>{event.content}</p>
                <p>
                  <strong>Goal:</strong> {event.goal}
                </p>
                <p>
                  <strong>Number of Participants:</strong> {event.number}
                </p>
              </Card>
            </List.Item>
          )}
        />
      </TabPane>
    </Tabs>
  );
}
