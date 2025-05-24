import { useEffect } from "react";

function Session() {
  useEffect(() => {
    const ROSLIB = window.ROSLIB;

    const ros = new ROSLIB.Ros({
      url: "ws://rocky.hcrlab.cs.washington.edu:9090",
    });

    let trajectoryClient;
    let cmdVelTopic;

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
      trajectoryClient = new ROSLIB.ActionHandle({
        ros,
        name: "/stretch_controller/follow_joint_trajectory",
        actionType: "control_msgs/action/FollowJointTrajectory",
      });
    };

    const createCmdVelTopic = () => {
      cmdVelTopic = new ROSLIB.Topic({
        ros,
        name: "/stretch/cmd_vel",
        messageType: "geometry_msgs/Twist",
      });
    };

    const executeFollowJointTrajectory = (jointNames, jointPositions) => {
      const goal = new ROSLIB.ActionGoal({
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
      trajectoryClient.createClient(goal);
    };

    const rosEvents = () => {
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
          "Error connecting to Stretch (see console for details)";
        console.error("Error connecting to websocket server:", error);
      });

      ros.on("close", () => {
        document.getElementById("connection").innerHTML = "Disconnected";
        document.getElementById("camera").style.display = "none";
        document.getElementById("buttons").style.display = "none";
        console.log("Connection to websocket server closed.");
      });
    };

    rosEvents();
  }, []);

  const openGripper = () => {
    executeFollowJointTrajectory(["gripper_aperture"], [0.1]);
  };

  const closeGripper = () => {
    executeFollowJointTrajectory(["gripper_aperture"], [-0.03]);
  };

  const moveLiftToTop = () => {
    executeFollowJointTrajectory(["joint_lift"], [1.1]);
  };

  const moveLiftToMiddle = () => {
    executeFollowJointTrajectory(["joint_lift"], [0.6]);
  };

  const moveBaseForward = () => {
    executeFollowJointTrajectory(["translate_mobile_base"], [0.1]);
  };

  const moveBaseBackward = () => {
    executeFollowJointTrajectory(["translate_mobile_base"], [-0.1]);
  };

  const rollWrist = () => {
    executeFollowJointTrajectory(["joint_wrist_roll"], [-0.1]);
  };

  const unrollWrist = () => {
    executeFollowJointTrajectory(["joint_wrist_roll"], [0.1]);
  };

  const followPath = () => {
    executeFollowJointTrajectory(["translate_mobile_base"], [0.1]);
    executeFollowJointTrajectory(["rotate_mobile_base"], [0.1]);
    executeFollowJointTrajectory(["translate_mobile_base"], [0.1]);
  };

  return (
    <div>
      <h1>Simple roslib Example</h1>
      <p id="connection">Connecting...</p>
      <div id="camera" style={{ display: "none" }}>
        <img
          id="cameraImage"
          style={{
            transform: "rotate(90deg)",
            position: "relative",
            left: "-80px",
            top: "100px",
          }}
          alt="camera stream"
        />
      </div>
      <div
        id="buttons"
        style={{ display: "none", position: "relative", left: "250px", top: "-100px" }}
      >
        <ul style={{ listStyle: "none" }}>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={openGripper}>Open gripper</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={closeGripper}>Close gripper</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={moveBaseForward}>Move base forward</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={moveBaseBackward}>Move base backward</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={moveLiftToTop}>Move lift to top</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={moveLiftToMiddle}>Move lift to middle</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={rollWrist}>Roll wrist</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={unrollWrist}>Unroll wrist</button>
          </li>
          <li style={{ marginBottom: "20px" }}>
            <button onClick={followPath}>Follow path</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Session;
