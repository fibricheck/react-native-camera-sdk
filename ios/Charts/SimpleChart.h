//
//  SimpleChart.m
//  FibriCheck
//
//  Created by Qompium on 23/04/2018.
//  Copyright © 2018 Qompium. All rights reserved.
//

#import <UIKit/UIKit.h>
@interface SimpleChart : UIView {
  float min;
  float max;
  float delta;
  int index;
}

@property (nonatomic) NSInteger sampleTime;

@property (weak, nonatomic) UIColor *lineColor;
/*!
 *  Contains all the points currently displayed on the chart
 */
@property (nonatomic, retain) NSMutableArray *points;
/*!
 *  Set to YES for stems
 */
@property  bool peaks;

-(void) addPoint:(NSNumber *) newPoint;

@end
