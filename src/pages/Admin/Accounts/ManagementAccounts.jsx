import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../Services/firebase";

export default function ManagementAccount() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner") {
          users.push({ ...data, id: doc.id });
        }
      });
      setUsers(users);
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    await deleteDoc(doc(db, "Users", userId));
    setUsers(users.filter((user) => user.id !== userId));
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
    },
    {
      title: "Apartment",
      dataIndex: "Room",
      key: "Room",
    },
    {
      title: "Number Phone",
      dataIndex: "Phone",
      key: "Phone",
    },
    {
      title: "Action",
      key: "action",
      render: (_, user) => (
        <>
          <Button danger onClick={() => handleDelete(user.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return <Table columns={columns} dataSource={users} rowKey="id" bordered />;
}
