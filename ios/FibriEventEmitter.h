//
//  FibriEventEmitter.h
//  FibriCheck
//
//  Created by Qompium on 12/02/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface FibriEventEmitter : RCTEventEmitter <RCTBridgeModule>

+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload;

@end
