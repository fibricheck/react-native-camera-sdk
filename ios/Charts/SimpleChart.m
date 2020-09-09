//
//  SimpleChart.m
//  FibriCheck
//
//  Created by Qompium on 23/04/2018.
//  Copyright © 2018 Qompium. All rights reserved.
//

#import "SimpleChart.h"

@implementation SimpleChart

- (id)init {
  self = [super init];
  return self;
}

- (id)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    delta = 1;
    self.peaks = NO;
    self.lineColor = [UIColor colorWithRed:87.0/255.0 green:172.0/255.0 blue:157.0/255.0 alpha:1.0];
  }
  return self;
}

- (void)drawRect:(CGRect)rect {
  if (_points.count != 0) {
    // Drawing code.
    CGContextRef context=UIGraphicsGetCurrentContext();
    CGContextSetLineWidth(context, 2);
    
    // Actual signal
    CGContextSetStrokeColorWithColor(context, self.lineColor.CGColor);
    CGContextBeginPath(context);
    float xpos = self.bounds.size.width;
    float ypos = self.bounds.size.height - ([[_points objectAtIndex:0] floatValue] - min+(delta/1000))*(self.bounds.size.height/delta);
    CGContextMoveToPoint(context, xpos, ypos);
    for (int i = 1; i < _points.count; i++) {
      xpos-=3;
      ypos=[[_points objectAtIndex:i] floatValue];
      if (self.peaks) {
        CGContextAddLineToPoint(context, xpos, self.bounds.size.height);
      }
      CGContextAddLineToPoint(context, xpos, self.bounds.size.height - (ypos - min+(delta/1000))*(self.bounds.size.height/delta));
      if (self.peaks) {
        CGContextAddLineToPoint(context, xpos, self.bounds.size.height);
      }
    };
    CGContextStrokePath(context);
  }
}

-(void) addPoint:(NSNumber *) newPoint {
  if (!_points) _points = [[NSMutableArray alloc] init];
  [_points insertObject:newPoint atIndex:0];
  while (_points.count > self.bounds.size.width/3) {
    [_points removeLastObject];
  }
  min = 1000;
  max = -1000;
  for (int i = 1; i< _points.count; i++) {
    if ([[_points objectAtIndex:i] floatValue] < min) {
      min = [[_points objectAtIndex:i] floatValue];
    } else if([[_points objectAtIndex:i] floatValue] > max) {
      max = [[_points objectAtIndex:i] floatValue];
    }
  }
  
  min -= 15;
  max += 15;
  
  delta = max - min;
  if (delta == 0 ) {
    delta = 1;
  }
}

- (void)dealloc {
  self.points = nil;
}

@end
