#import "FibriCheckerComponent.h"

#define INIT_DEPRECATION_NOTICE "Objective-C Initialization of the FibriCheck SDK has been deprecated. Use JavaScript init instead."

@interface RCTFibriCheck : NSObject

+ (RCTFibriCheck *) sharedInstance;

@property (nonatomic) BOOL didStartObserving;

- (void)initFibriCheck:(NSDictionary *)launchOptions;

@end
