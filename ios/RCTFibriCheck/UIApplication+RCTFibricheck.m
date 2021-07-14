#import <UIKit/UIKit.h>
#import <objc/runtime.h>

@interface RCTFibriCheck
+ (RCTFibriCheck *) sharedInstance;
- (void)initFibriCheck:(NSDictionary *)launchOptions;
@end

@implementation UIApplication(FibriCheckReactNative)

//helper method to swizzle instance methods
static void injectSelector(Class newClass, SEL newSel, Class addToClass, SEL makeLikeSel) {
    Method newMeth = class_getInstanceMethod(newClass, newSel);
    IMP imp = method_getImplementation(newMeth);
    const char* methodTypeEncoding = method_getTypeEncoding(newMeth);

    BOOL successful = class_addMethod(addToClass, makeLikeSel, imp, methodTypeEncoding);
    if (!successful) {
        class_addMethod(addToClass, newSel, imp, methodTypeEncoding);
        newMeth = class_getInstanceMethod(addToClass, newSel);

        Method orgMeth = class_getInstanceMethod(addToClass, makeLikeSel);

        method_exchangeImplementations(orgMeth, newMeth);
    }
}

//gets called by the ObjC runtime early in the app lifecycle
+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        method_exchangeImplementations(class_getInstanceMethod(self, @selector(setDelegate:)), class_getInstanceMethod(self, @selector(setFibriCheckReactNativeDelegate:)));
    });
}


- (void) setFibriCheckReactNativeDelegate:(id<UIApplicationDelegate>)delegate {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class delegateClass = [delegate class];
        injectSelector(self.class, @selector(fibriCheckApplication:didFinishLaunchingWithOptions:),
                       delegateClass, @selector(application:didFinishLaunchingWithOptions:));
        [self setFibriCheckReactNativeDelegate:delegate];
    });
}

- (BOOL)fibriCheckApplication:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {
    [[RCTFibriCheck sharedInstance] initFibriCheck:launchOptions];
    if ([self respondsToSelector:@selector(fibriCheckApplication:didFinishLaunchingWithOptions:)])
        return [self fibriCheckApplication:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
}

@end
