require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "@fibricheck/react-native-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  @fibricheck/react-native-sdk
                   DESC
  s.homepage     = "https://github.com/fibricheck/fibricheck-react-native-sdk"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Craftzing" => "jan.vandertaelen@craftzing.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/fibricheck/fibricheck-react-native-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
end

