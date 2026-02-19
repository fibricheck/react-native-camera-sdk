require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-camera-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  @fibricheck/react-native-camera-sdk
                   DESC
  s.homepage     = "https://github.com/fibricheck/react-native-camera-sdk"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { 'FibriCheck' => 'development@fibricheck.com' }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/fibricheck/react-native-camera-sdk.git", :tag => "v1.1.1-fda8" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.dependency 'FibriCheckCameraSDK', '1.1.1'
  s.requires_arc = true

  s.dependency "React"
end

