//
//  MeasurementData.h
//  FibriCheckerComponent
//
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import <Foundation/Foundation.h>

@class MotionData;
@class ImageProcessorConfig;
@class DataPoint;

@interface Measurement : NSObject

@property NSMutableArray * quadrants;
@property MotionData * acc;
@property MotionData * gyro;
@property MotionData * grav;
@property MotionData * rotation;
@property NSMutableArray * time;
@property NSString * version;
@property NSUInteger heartRate;
@property NSMutableArray * ppg;
@property NSTimeInterval startTime;

- (instancetype)initWithConfig:(ImageProcessorConfig*)config;

- (void)addDataPoint:(DataPoint*)dp;
- (void)processData;
- (NSDictionary*)mapToDictionary;
- (NSString *)mapToJson;

@end
