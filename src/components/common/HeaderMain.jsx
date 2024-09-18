import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import { Link } from "react-router-dom";

import AvatarOwner from "../layout/Owner/AvatarOwner";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";

const { Header } = Layout;

export default function HeaderMain() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "Users", user.uid); // Ensure correct collection path
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setOwner(userDoc.data());
          } else {
            message.error("User data not found.");
          }
        } else {
          message.error("User not authenticated.");
        }
      } catch (error) {
        message.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);
  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#001529",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Menu.Item key="home">
            <Link to={owner?.role === "owner" ? "/owner" : "/"}>Home</Link>
          </Menu.Item>
          <Menu.Item key="about">About us</Menu.Item>
          <Menu.Item key="feature">Features</Menu.Item>
          <Menu.Item key="instruct">Instruction</Menu.Item>
          <Menu.Item key="contact">Contact</Menu.Item>
        </Menu>
        <div style={{ marginLeft: "auto" }}>
          <AvatarOwner />
        </div>
      </Header>
    </Layout>
  );
}
