//
//  FibriCheckerComponentTests.m
//  FibriCheckerComponentTests
//
//  Created by Alain Hufkens on 15/01/2018.
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "BeatListener.h"
#import "Filter.h"
#import "FCSGFilter.h"

@interface FibriCheckerComponentTests : XCTestCase

@end

@implementation FibriCheckerComponentTests

- (void)setUp {
    [super setUp];
}

- (void)tearDown {
    [super tearDown];
}

- (void)testHeartrate {
    
    NSDictionary *data = [FibriCheckerComponentTests jsonForFile:@"BeatListenerTest"][@"data"];
    NSArray *timeValues = (NSArray*)data[@"time"];
    
    int heartrate = 69;
    NSArray *yValues = (NSArray*)data[@"color"][@"y"];
    
    NSUInteger count = [timeValues count];
    CGFloat previousDataValue = 0;
    
    BeatListener *beatListener = [BeatListener new];
    
    Filter *filter = [[Filter alloc] initLowPass];
    FCSGFilter *sgFilter = [FCSGFilter new];
    
    for (NSUInteger i = 0; i < count; i++) {
        CGFloat yValue = [(NSNumber*)yValues[i] floatValue];
        NSTimeInterval timestamp = [(NSNumber*)timeValues[i] doubleValue];
        
        CGFloat valueDiff = previousDataValue - yValue;
        CGFloat valueCalculated = [sgFilter calculateValue:[filter pushValue:valueDiff]];
        
        previousDataValue = yValue;
        
        [beatListener correlateWithValue:valueCalculated timestamp:timestamp];
    }
    
    XCTAssertEqual(heartrate, [beatListener heartRate]);
}

#pragma mark - JSON Helper

+ (NSDictionary*)jsonForFile:(NSString*)fileName {
    NSLog(@"jsonForFile >> %@", fileName);
    
    NSError *error;
    NSString *path = [[NSBundle mainBundle] pathForResource:fileName ofType:@"json"];
    NSString *content = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
    NSData *objectData = [content dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&error];
    if (error) {
        NSLog(@"%@", error);
    }
    
    return json;
}

@end
