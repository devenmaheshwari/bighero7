cmake_minimum_required(VERSION 3.5)
project(usbscale_node)

# Require C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source ROS2 Humble:
#   source /opt/ros/humble/setup.bash

# Find ament and ROS 2 packages
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# Use pkg-config to find libusb-1.0
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBUSB REQUIRED libusb-1.0)

# Include directories for libusb
include_directories(
  ${LIBUSB_INCLUDE_DIRS}
)

# Link directories for libusb
link_directories(
  ${LIBUSB_LIBRARY_DIRS}
)

# Build the node executable
add_executable(usbscale_node
  usbscale_node.cpp
)

# Link against ROS2 and libusb
ament_target_dependencies(usbscale_node
  rclcpp
  std_msgs
)
target_link_libraries(usbscale_node
  ${LIBUSB_LIBRARIES}
)

# Install rule (optional)
install(
  TARGETS usbscale_node
  RUNTIME DESTINATION bin
)

ament_package()
