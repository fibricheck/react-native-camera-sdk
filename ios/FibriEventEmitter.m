//
//  FibriEventEmitter.m
//  FibriCheck
//
//  Created by Qompium on 12/02/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "FibriEventEmitter.h"
#import "React/RCTLog.h"
#import "React/RCTBridge.h"

@implementation FibriEventEmitter

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"heartBeat", @"sampleReady", @"fingerDetected", @"pulseDetected", @"calibrationReady", @"measurementStart", @"measurementFinished", @"measurementProcessed", @"fingerRemoved", @"timeRemaining"];
}

- (void)startObserving {
  NSLog(@"-------- Starting to observe FEM --------");
  RCTLogInfo(@"-------- Starting to observe FEM --------");
  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  for (NSString *notificationName in [self supportedEvents]) {
    [center addObserver:self
               selector:@selector(emitEventInternal:)
                   name:notificationName
                 object:nil];
  }
}

- (void)stopObserving {
  NSLog(@"-------- Stopping to observe FEM --------");
  RCTLogInfo(@"----- Stop Observing FEM -----");
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitEventInternal:(NSNotification *)notification {
  // NSLog(@"--------- Internal Event logged FEM -----------");
  // RCTLogInfo(@"--------- Internal Event logged FEM-----------");
  [self sendEventWithName:notification.name
                     body:notification.userInfo];
}

+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload {
  // NSLog(@"--------- External Event logged FEM -----------");
  // RCTLogInfo(@"--------- External Event logged FEM -----------");
  [[NSNotificationCenter defaultCenter] postNotificationName:name
                                                      object:self
                                                    userInfo:payload];
}

@end
