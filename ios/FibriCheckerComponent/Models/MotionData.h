//
//  MotionData.h
//  FibriCheckerComponent
//
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface MotionData : NSObject

@property (strong) NSMutableArray * x;
@property (strong) NSMutableArray * y;
@property (strong) NSMutableArray * z;

-(void)addValueX:(double)x Y:(double)y Z:(double)z;

@end
