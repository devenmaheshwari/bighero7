cmake_minimum_required(VERSION 3.5)
project(usbscale_node)

# Require C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Make sure you source ROS2 Humble before calling cmake:
#   source /opt/ros/humble/setup.bash

# Find the ROS 2 client libraries
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# Use pkg-config to find libusb-1.0
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBUSB REQUIRED libusb-1.0)

# Tell CMake where libusb’s headers & libs are
include_directories(${LIBUSB_INCLUDE_DIRS})
link_directories   (${LIBUSB_LIBRARY_DIRS})

# Build our node
add_executable(usbscale_node
  usbscale_node.cpp
)

# Link against libusb and the ROS 2 libraries
target_link_libraries(usbscale_node
  ${LIBUSB_LIBRARIES}
  rclcpp::rclcpp
  std_msgs::std_msgs
)

# (Optional) install rule if you ever want to package it
#install(TARGETS usbscale_node RUNTIME DESTINATION bin)
