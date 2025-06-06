#include <chrono>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <unistd.h>

#include <rclcpp/rclcpp.hpp>
#include <std_msgs/msg/float64.hpp>
#include <libusb-1.0/libusb.h>
#include "scales.h"

using namespace std::chrono_literals;

// Report sizes
#define WEIGH_REPORT_SIZE 6

// Helper prototypes from usbscale.c
static libusb_device* find_nth_scale(libusb_device **devs, int index);
static bool is_scale(uint16_t idVendor, uint16_t idProduct);
static uint8_t get_first_endpoint_address(libusb_device* dev);

class UsbScaleNode : public rclcpp::Node {
public:
  UsbScaleNode()
  : Node("usbscale_node") {
    // Declare and read debug parameter
    this->declare_parameter<bool>("debug", false);
    this->get_parameter("debug", debug_);

    publisher_ = this->create_publisher<std_msgs::msg::Float64>("/scale/weight", 10);

    // Initialize libusb
    if (libusb_init(nullptr) < 0) {
      RCLCPP_ERROR(this->get_logger(), "Failed to initialize libusb");
      rclcpp::shutdown();
      return;
    }

    // Discover devices
    libusb_device **devs;
    ssize_t cnt = libusb_get_device_list(nullptr, &devs);
    if (cnt < 0) {
      RCLCPP_ERROR(this->get_logger(), "No USB devices found");
      rclcpp::shutdown();
      return;
    }

    // Find the first matching scale
    libusb_device *dev = find_nth_scale(devs, 1);
    libusb_free_device_list(devs, 1);
    if (!dev) {
      RCLCPP_ERROR(this->get_logger(), "No USB scale found");
      rclcpp::shutdown();
      return;
    }

    // Open and claim
    if (libusb_open(dev, &handle_) < 0) {
      RCLCPP_ERROR(this->get_logger(), "Failed to open USB scale");
      rclcpp::shutdown();
      return;
    }
#ifdef __linux__
    libusb_detach_kernel_driver(handle_, 0);
#endif
    libusb_claim_interface(handle_, 0);
    endpoint_ = get_first_endpoint_address(dev);

    // Start periodic timer
    timer_ = this->create_wall_timer(250ms, std::bind(&UsbScaleNode::on_timer, this));
  }

  ~UsbScaleNode() override {
#ifdef __linux__
    libusb_attach_kernel_driver(handle_, 0);
#endif
    libusb_release_interface(handle_, 0);
    libusb_close(handle_);
    libusb_exit(nullptr);
  }

private:
  void on_timer() {
    unsigned char data[WEIGH_REPORT_SIZE];
    int transferred = 0;
    int r = libusb_interrupt_transfer(
      handle_, endpoint_, data, WEIGH_REPORT_SIZE, &transferred, 1000);
    if (r == 0) {
      if (transferred == WEIGH_REPORT_SIZE) {
        // Valid weight reading
        uint8_t report = data[0];
        uint8_t status = data[1];
        if ((report == 0x03 || report == 0x04) && status == 0x04) {
          int8_t expt = static_cast<int8_t>(data[3]);
          double raw = static_cast<double>(le16toh((data[5] << 8) | data[4]));
          double weight = raw * std::pow(10, expt);

          auto msg = std_msgs::msg::Float64();
          msg.data = weight;
          publisher_->publish(msg);
          RCLCPP_INFO(this->get_logger(), "Weight: %.3f", weight);
          if (debug_) std::cout << "[DEBUG] Weight (raw): " << weight << std::endl;
        }
      } else {
        // Optional: log info/debug that a short or non-weight packet was received
        if (debug_) {
          RCLCPP_DEBUG(this->get_logger(), "Short transfer (%d bytes)", transferred);
        }
      }
    } else {
      RCLCPP_ERROR(this->get_logger(), "USB transfer failed: %s", libusb_error_name(r));
    }
  }

  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
  libusb_device_handle *handle_ = nullptr;
  uint8_t endpoint_ = 0;
  bool debug_ = false;
};

int main(int argc, char **argv) {
  rclcpp::init(argc, argv);
  auto node = std::make_shared<UsbScaleNode>();
  rclcpp::spin(node);
  rclcpp::shutdown();
  return 0;
}

// --- Implementation of helpers ---

static libusb_device* find_nth_scale(libusb_device **devs, int index) {
  int i = 0, curr = 0;
  uint16_t last_addr = 0;
  libusb_device *dev;
  while ((dev = devs[i++]) != nullptr) {
    libusb_device_descriptor desc;
    if (libusb_get_device_descriptor(dev, &desc) < 0) continue;
    if (!is_scale(desc.idVendor, desc.idProduct)) continue;
    uint16_t addr = (libusb_get_bus_number(dev) << 8) | libusb_get_device_address(dev);
    if (addr == last_addr) continue;
    last_addr = addr;
    curr++;
    if (curr == index) return dev;
  }
  return nullptr;
}

static bool is_scale(uint16_t idVendor, uint16_t idProduct) {
  for (int i = 0; i < NSCALES; ++i) {
    if (idVendor == scales[i][0] && idProduct == scales[i][1])
      return true;
  }
  return false;
}

static uint8_t get_first_endpoint_address(libusb_device* dev) {
  struct libusb_config_descriptor *config;
  uint8_t ep = LIBUSB_ENDPOINT_IN | LIBUSB_RECIPIENT_INTERFACE;
  if (libusb_get_config_descriptor(dev, 0, &config) == 0) {
    ep = config->interface[0].altsetting[0].endpoint[0].bEndpointAddress;
    libusb_free_config_descriptor(config);
  }
  return ep;
}
