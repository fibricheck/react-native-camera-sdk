require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-fibricheck"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-fibricheck
                   DESC
  s.homepage     = "https://bitbucket.org/antwerpfactory/react-native-fibricheck"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Craftzing" => "jan.vandertaelen@craftzing.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://bitbucket.org/antwerpfactory/react-native-fibricheck.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
end

