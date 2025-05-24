cmake_minimum_required(VERSION 3.5)
project(usbscale_node)

# Require C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find ROS2 and libusb
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(libusb-1.0 REQUIRED)

# Where to look for pkg‐config headers
include_directories(${LIBUSB_1_INCLUDE_DIRS})

# Build our node
add_executable(usbscale_node
  usbscale_node.cpp
)
ament_target_dependencies(usbscale_node
  rclcpp
  std_msgs
  libusb-1.0
)

# Install so we can run it from here
install(TARGETS usbscale_node
  RUNTIME DESTINATION .
)
