import { useEffect } from "react";

function Session() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js";
    script.onload = () => {
      const ros = new window.ROSLIB.Ros({ url: "ws://localhost:9090" });

      ros.on("connection", () => {
        document.getElementById("status").innerHTML = "successful";
      });

      ros.on("error", (error) => {
        document.getElementById("status").innerHTML = `errored out (${error})`;
      });

      ros.on("close", () => {
        document.getElementById("status").innerHTML = "closed";
      });

      const cmdVel = new window.ROSLIB.Topic({
        ros: ros,
        name: "/cmd_vel",
        messageType: "geometry_msgs/Twist",
      });

      const twist = {
        linear: { x: 0.1, y: 0.2, z: 0.3 },
        angular: { x: -0.1, y: -0.2, z: -0.3 },
      };

      cmdVel.publish(twist);

      const my_topic_listener = new window.ROSLIB.Topic({
        ros,
        name: "/my_topic",
        messageType: "std_msgs/String",
      });

      my_topic_listener.subscribe((message) => {
        const ul = document.getElementById("messages");
        const newMessage = document.createElement("li");
        newMessage.appendChild(document.createTextNode(message.data));
        ul.appendChild(newMessage);
      });
    };

    document.body.appendChild(script);
  }, []);

  return (
    <main className="session">
      <h2>Rosbridge Demo</h2>
      <p>To see this page update:</p>
      <ul>
        <li>Run a Rosbridge connection at <code>ws://localhost:9090</code></li>
        <li>Start publishing ROS messages to <code>/my_topic</code></li>
      </ul>
      <p>
        View the full tutorial at{" "}
        <a
          href="https://foxglove.dev/blog/using-rosbridge-with-ros1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Using Rosbridge with ROS 1
        </a>{" "}
        or{" "}
        <a
          href="https://foxglove.dev/blog/using-rosbridge-with-ros2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Using Rosbridge with ROS 2
        </a>
        .
      </p>

      <hr />

      <p>
        Connection: <span id="status" style={{ fontWeight: "bold" }}>N/A</span>
      </p>
      <p>
        <code>/my_topic</code> messages received:
        <ul id="messages" style={{ fontWeight: "bold" }}></ul>
      </p>
    </main>
  );
}

export default Session;
