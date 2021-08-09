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
    self.lineColor = [UIColor whiteColor];
    self.stepIncrement = 2.5;
    self.verticalOffset = 6;
  }
  return self;
}

- (void)drawRect:(CGRect)rect {
  [self drawGraphArea];
  [self drawGraphLine];
}

-(void) drawGraphArea {
  if (_points.count != 0) {
    float xpos = self.bounds.size.width;
    float ypos = self.bounds.size.height - ([[_points objectAtIndex:0] floatValue] - min + (delta / 1000)) * (self.bounds.size.height / delta);
    float baseLine = self.bounds.size.height;

    CGContextRef context=UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [[UIColor colorWithRed:0.12 green:0.55 blue:0.58 alpha:1.0] CGColor]);

    CGContextBeginPath(context);
    CGContextMoveToPoint(context, xpos, baseLine);
    CGContextAddLineToPoint(context, xpos, ypos);

    for (int i = 1; i < _points.count; i++) {
      xpos -= _stepIncrement;
      ypos = [[_points objectAtIndex:i] floatValue];

      CGFloat graphPoint = (ypos - min + (delta / 1000)) * (self.bounds.size.height / delta);
      CGContextAddLineToPoint(context, xpos, self.bounds.size.height - graphPoint);
    };

    CGContextAddLineToPoint(context, xpos - _stepIncrement, baseLine);
    CGContextClosePath(context);
    CGContextDrawPath(context, kCGPathFill);
  }
}

-(void) drawGraphLine {
  if (_points.count != 0) {
    float xpos = self.bounds.size.width;
    float ypos = self.bounds.size.height - ([[_points objectAtIndex:0] floatValue] - min + (delta / 1000)) * (self.bounds.size.height / delta);

    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetLineWidth(context, 2);
    CGContextSetStrokeColorWithColor(context, self.lineColor.CGColor);

    CGContextBeginPath(context);
    CGContextMoveToPoint(context, xpos, ypos);

    for (int i = 1; i < _points.count; i++) {
      xpos -= _stepIncrement;
      ypos = [[_points objectAtIndex:i] floatValue];

      CGFloat graphPoint = (ypos - min + (delta / 1000)) * (self.bounds.size.height / delta);
      CGContextAddLineToPoint(context, xpos, self.bounds.size.height - graphPoint);
    };

    CGContextStrokePath(context);
  }
}

-(void) addPoint:(NSNumber *) newPoint {
  if (!_points) _points = [[NSMutableArray alloc] init];
  [_points insertObject:newPoint atIndex:0];
  while (_points.count > self.bounds.size.width / _stepIncrement) {
    [_points removeLastObject];
  }
  min = 1000;
  max = -1000;
  for (int i = 1; i < _points.count; i++) {
    if ([[_points objectAtIndex:i] floatValue] < min) {
      min = [[_points objectAtIndex:i] floatValue];
    } else if([[_points objectAtIndex:i] floatValue] > max) {
      max = [[_points objectAtIndex:i] floatValue];
    }
  }

  min -= _verticalOffset;
  max += _verticalOffset;

  delta = max - min;
  if (delta == 0 ) {
    delta = 1;
  }
}

- (void)dealloc {
  self.points = nil;
}

@end
