import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Radio, Space, message } from 'antd';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from '../../Services/firebase';
import { Link, useNavigate } from 'react-router-dom';
const { TextArea } = Input;

export default function Feedback() {
  const [feedback, setFeedback] = useState({
    satisfaction: '',
    reliability: '',
    security: '',
    improvementSuggestions: '',
    usefulFeatures: '',
  });
  const [isMandatory, setIsMandatory] = useState(false);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkFeedbackRequired = async () => {
      const currentDate = new Date();
      const day = currentDate.getDate();
      const user = auth.currentUser;

      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();       
          if (userData.role === "admin") {
            setIsAdmin(true);
          }
          if (userData.role === "owner" && day >= 1 && day <= 13) {
            setIsMandatory(true);
          } else if (userData.role === "owner") {
            navigate('/owner');
          }
        } else {
          message.error("User not found or unauthorized");
          navigate('/login');
        }
      }
    };

    checkFeedbackRequired();
  }, [navigate]);

  const handleChange = (name, value) => {
    setFeedback({ ...feedback, [name]: value });
  };

  const handleSubmit = async () => {
    if (!feedback.satisfaction || !feedback.reliability || !feedback.security) {
      alert("Please fill out all required fields.");
      return;
    }
    const currentDate = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const documentId = `${month}-${year}`;

    try {
      const summaryRef = doc(db, "feedback_summary", documentId); 
      const summaryDoc = await getDoc(summaryRef);
      let summaryData;
      if (summaryDoc.exists()) {
        summaryData = summaryDoc.data();
      } else {
        summaryData = {
          satisfaction: { "1": 0, "2": 0, "3": 0, "4": 0 },
          reliability: { "1": 0, "2": 0, "3": 0, "4": 0 },
          security: { "1": 0, "2": 0, "3": 0, "4": 0 },
          improvementSuggestions: [],
          usefulFeatures: []
        };
      }
      summaryData.satisfaction[feedback.satisfaction] += 1;
      summaryData.reliability[feedback.reliability] += 1;
      summaryData.security[feedback.security] += 1;

      summaryData.improvementSuggestions.push(feedback.improvementSuggestions);
      summaryData.usefulFeatures.push(feedback.usefulFeatures);
      await setDoc(summaryRef, summaryData);
      await setDoc(doc(db, "Users", auth.currentUser.uid), { feedbackCompleted: documentId }, { merge: true });
      console.log("Feedback summary updated successfully");
      alert("Feedback submitted successfully!");
      setFeedback({
        satisfaction: '',
        reliability: '',
        security: '',
        improvementSuggestions: '',
        usefulFeatures: '',
      });
      navigate('/owner');
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-gray-800">Feedback</h1>
      {isAdmin && (
        <div className="mb-4 text-right">
          <Link to="/reportFeedback" className="text-blue-500 hover:underline">
            View Feedback Report
          </Link>
        </div>
      )}
      <Form layout="vertical" onFinish={handleSubmit}>

        <Form.Item label="Overall, how would you rate your experience using the condominium management software?" className="mb-4">
          <Radio.Group
            onChange={(e) => handleChange('satisfaction', e.target.value)}
            value={feedback.satisfaction}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="1">1 - The software does not meet basic needs</Radio>
              <Radio value="2">2 - The software meets basic needs but has room for improvement</Radio>
              <Radio value="3">3 - The software performs well and meets most needs</Radio>
              <Radio value="4">4 - The software performs excellently, exceeding expectations</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Is the software stable and reliable (few errors, no crashes)?" className="mb-4">
          <Radio.Group
            onChange={(e) => handleChange('reliability', e.target.value)}
            value={feedback.reliability}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="1">1 - Frequent errors or issues</Radio>
              <Radio value="2">2 - Minor errors sometimes, but not significantly disruptive</Radio>
              <Radio value="3">3 - Rarely has errors, runs smoothly</Radio>
              <Radio value="4">4 - Almost never has errors, operates seamlessly</Radio>      
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="How confident are you in the security of your personal information on the software?" className="mb-4">
          <Radio.Group
            onChange={(e) => handleChange('security', e.target.value)}
            value={feedback.security}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="1">1 - Concerns about data security</Radio>
              <Radio value="2">2 - Security is acceptable</Radio>
              <Radio value="3">3 - Fully trust the security of the system</Radio>
              <Radio value="4">4 - Trust in the system's security</Radio> 
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="What features in the software do you find most useful?" className="mb-4">
          <TextArea
            value={feedback.improvementSuggestions}
            onChange={(e) => handleChange('improvementSuggestions', e.target.value)}
            rows={4}
            placeholder="Please describe the features you find most useful"
            className="w-full border rounded-md p-2"
          />
        </Form.Item>

        <Form.Item label="Would you be willing to recommend this software to others?" className="mb-4">
          <TextArea
            value={feedback.usefulFeatures}
            onChange={(e) => handleChange('usefulFeatures', e.target.value)}
            rows={4}
            placeholder="Would you recommend this software? Why or why not?"
            className="w-full border rounded-md p-2"
          />
        </Form.Item>

        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" className="px-6 py-2 text-lg rounded-lg shadow-sm w-full sm:w-auto">
            Submit Feedback
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
