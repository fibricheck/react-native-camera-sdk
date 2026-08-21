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
  s.platforms    = { :ios => "13.4" }
  s.source       = { :git => "https://github.com/fibricheck/react-native-camera-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency 'FibriCheckCameraSDK', '>= 1.1.0'
  s.requires_arc = true

  # Fabric components (ios/RCTFibriCheck/Fabric) need the Codegen-generated headers/dependencies;
  # install_modules_dependencies is the standard conditional used by Fabric-ready community
  # libraries so this podspec still works against older RN versions without it.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end

