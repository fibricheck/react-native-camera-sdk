#import <UIKit/UIKit.h>
#import "RNTFibriCheckView.h"

@class FibriChecker;

@interface RNTFibriCheckViewController : UIViewController <FibriCheckViewDelegate>

+ (nullable FibriChecker *)sharedFibriChecker;

@end
