cmake_minimum_required(VERSION 3.5)
project(usbscale_node)

# Require C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Make sure to source ROS 2 Humble before configuring:
#   source /opt/ros/humble/setup.bash

# Find ROS2 packages (header-only or link libraries)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# Use pkg-config to locate libusb-1.0
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBUSB REQUIRED libusb-1.0)

# Include directories for libusb and std_msgs
include_directories(
  ${LIBUSB_INCLUDE_DIRS}
  ${std_msgs_INCLUDE_DIRS}
)

# Library directories for libusb
link_directories(${LIBUSB_LIBRARY_DIRS})

# Build the ROS2 node
add_executable(usbscale_node
  usbscale_node.cpp
)

# Link against libusb and rclcpp
target_link_libraries(usbscale_node
  ${LIBUSB_LIBRARIES}
  rclcpp::rclcpp
)

# Optional: install the executable in 'bin/' if you wish
install(
  TARGETS usbscale_node
  RUNTIME DESTINATION bin
)
