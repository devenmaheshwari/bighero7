import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Session() {
  const [weightData, setWeightData] = useState([]);
  const rosRef = useRef(null);
  const trajectoryClientRef = useRef(null);
  const cmdVelRef = useRef(null);
  const MAX_POINTS = 50;

  const executeFollowJointTrajectory = (jointNames, jointPositions) => {
    if (!trajectoryClientRef.current) {
      console.error("Trajectory client not initialized");
      return;
    }

    const goal = new window.ROSLIB.ActionGoal({
      trajectory: {
        header: { stamp: { secs: 0, nsecs: 0 } },
        joint_names: jointNames,
        points: [
          {
            positions: jointPositions,
            time_from_start: { secs: 1, nsecs: 0 },
          },
        ],
      },
    });
    
    trajectoryClientRef.current.createClient(goal);
  };

  // joint trajectory functions
  const openGripper = () => {
    executeFollowJointTrajectory(['gripper_aperture'], [0.1]);
  };

  const closeGripper = () => {
    executeFollowJointTrajectory(['gripper_aperture'], [-0.03]);
  };

  const moveLiftToTop = () => {
    executeFollowJointTrajectory(['joint_lift'], [1.1]);
  };

  const moveLiftToMiddle = () => {
    executeFollowJointTrajectory(['joint_lift'], [0.6]);
  };

  const moveBaseForward = () => {
    executeFollowJointTrajectory(['translate_mobile_base'], [0.1]);
  };

  const moveBaseBackward = () => {
    executeFollowJointTrajectory(['translate_mobile_base'], [-0.1]);
  };

  const rollWrist = () => {
    executeFollowJointTrajectory(['joint_wrist_roll'], [-0.1]);
  };

  const unrollWrist = () => {
    executeFollowJointTrajectory(['joint_wrist_roll'], [0.1]);
  };

  const followPath = () => {
    executeFollowJointTrajectory(['translate_mobile_base'], [0.1]);
    executeFollowJointTrajectory(['rotate_mobile_base'], [0.1]);
    executeFollowJointTrajectory(['translate_mobile_base'], [0.1]);
  };


  useEffect(() => {
    // load ROSLIB script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/hello-vinitha/roslibjs@ros2actionclient/build/roslib.min.js';
    script.async = true;
    
    script.onload = () => {
      const ROSLIB = window.ROSLIB;
      const ros = new ROSLIB.Ros({
        url: "ws://rocky.hcrlab.cs.washington.edu:9090",
      });

      rosRef.current = ros;

      const weightTopic = new ROSLIB.Topic({
        ros,
        name: "/scale/weight",
        messageType: "std_msgs/Float64",
      });

      weightTopic.subscribe((message) => {
        const value = message.data;
        const timestamp = Date.now();

        setWeightData((prev) => {
          const newData = [...prev, { time: timestamp, weight: value }];
          return newData.length > MAX_POINTS ? newData.slice(-MAX_POINTS) : newData;
        });
      });

      const subscribeToCameraVideo = () => {
        const cameraImage = document.getElementById("cameraImage");
        const topic = new ROSLIB.Topic({
          ros,
          name: "/camera/color/image_raw/compressed",
          messageType: "sensor_msgs/CompressedImage",
        });
        topic.subscribe((message) => {
          cameraImage.src = "data:image/jpg;base64," + message.data;
        });
      };

      const createTrajectoryClient = () => {
        trajectoryClientRef.current = new ROSLIB.ActionHandle({
          ros: ros,
          name: "/stretch_controller/follow_joint_trajectory",
          actionType: "control_msgs/action/FollowJointTrajectory",
        });
      };

      const createCmdVelTopic = () => {
        cmdVelRef.current = new ROSLIB.Topic({
          ros,
          name: "/stretch/cmd_vel",
          messageType: "geometry_msgs/Twist",
        });
      };

      ros.on("connection", () => {
        document.getElementById("connection").innerHTML = "Connected to Stretch.";
        document.getElementById("camera").style.display = "block";
        document.getElementById("buttons").style.display = "block";

        subscribeToCameraVideo();
        createTrajectoryClient();
        createCmdVelTopic();
      });

      ros.on("error", (error) => {
        document.getElementById("connection").innerHTML =
          "Error connecting to Stretch (see console)";
        console.error("Error connecting to websocket server:", error);
      });

      ros.on("close", () => {
        document.getElementById("connection").innerHTML = "Disconnected";
        document.getElementById("camera").style.display = "none";
        document.getElementById("buttons").style.display = "none";
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div>
      <style>{`
        ul li { margin-bottom: 20px; list-style: none; }
        #camera { display: none; }
        #buttons { display: none; position: relative; left: 250px; top: -100px; }
        img#cameraImage { transform: rotate(90deg); position: relative; left: -80px; top: 100px; }
      `}</style>
      
      <h1>Simple roslib Example</h1>
      <p id="connection">Connecting...</p>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={weightData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            <YAxis domain={[0, 5000]} />
            <Tooltip />
            <Line dataKey="weight" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p>Weight: <span id="weightDisplay">{weightData.at(-1)?.weight?.toFixed(2) ?? "--"} g</span></p>

      <div id="camera">
        <img id="cameraImage" alt="camera stream" />
      </div>

      <div id="buttons">
        <ul>
          <li><button onClick={openGripper}>Open gripper</button></li>
          <li><button onClick={closeGripper}>Close gripper</button></li>
          <li><button onClick={moveBaseForward}>Move base forward</button></li>
          <li><button onClick={moveBaseBackward}>Move base backward</button></li>
          <li><button onClick={moveLiftToTop}>Move lift to top</button></li>
          <li><button onClick={moveLiftToMiddle}>Move lift to middle</button></li>
          <li><button onClick={rollWrist}>Roll wrist</button></li>
          <li><button onClick={unrollWrist}>Unroll wrist</button></li>
          <li><button onClick={followPath}>Follow path</button></li>
        </ul>
      </div>
    </div>
  );
}

export default Session;