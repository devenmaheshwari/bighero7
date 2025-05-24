cmake_minimum_required(VERSION 3.5)
project(usbscale_node)

# Use C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find ament (ROS2) and your ROS2 deps
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# Use pkg-config to find libusb-1.0
find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBUSB REQUIRED libusb-1.0)

# Tell CMake where libusb’s headers & libraries are
include_directories(${LIBUSB_INCLUDE_DIRS})
link_directories(${LIBUSB_LIBRARY_DIRS})

# Build the node
add_executable(usbscale_node src/usbscale_node.cpp)

# Link against ROS2 and libusb
ament_target_dependencies(usbscale_node
  rclcpp
  std_msgs
)
target_link_libraries(usbscale_node
  ${LIBUSB_LIBRARIES}
)

# Install so you can call it via ros2 run
install(
  TARGETS usbscale_node
  RUNTIME DESTINATION lib/${PROJECT_NAME}
)

ament_package()
