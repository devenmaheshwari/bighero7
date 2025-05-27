import { useEffect } from "react";

function ScaleView() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js";
    script.onload = () => {
      const ros = new window.ROSLIB.Ros({
        url: "ws://localhost:9090"
      });

      const statusEl = document.getElementById("status");
      ros.on("connection", () => (statusEl.textContent = "connected"));
      ros.on("error", ()     => (statusEl.textContent = "error"));
      ros.on("close", ()     => (statusEl.textContent = "closed"));

      // Subscribe to the scale topic
      const scaleTopic = new window.ROSLIB.Topic({
        ros,
        name: "/scale/weight",
        messageType: "std_msgs/Float64"
      });

      scaleTopic.subscribe((msg) => {
        document.getElementById("weight").textContent =
          msg.data.toFixed(2) + " kg";
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <h2>Scale Weight over Rosbridge</h2>
      <p>Status: <strong id="status">N/A</strong></p>
      <p>
        Current weight: <span id="weight">– kg</span>
      </p>
    </div>
  );
}

export default ScaleView;
