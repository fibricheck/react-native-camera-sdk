#import "RNTFibriCheckView.h"
#import <React/RCTLog.h>

@implementation RNTFibriCheckView

- (id)init {
  self = [super init];
  return self;
}

- (id)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    delta = 1;
    self.stepIncrement = 2.5;
    self.verticalOffset = 6;
  }
  return self;
}

- (void)drawRect:(CGRect)rect {
  if(self.graphBackgroundColor) {
    [self drawGraphArea];
  }
  [self drawGraphLine];
}

-(void) drawGraphArea {
  if (_points.count != 0) {
    float xpos = self.bounds.size.width;
    float ypos = self.bounds.size.height - ([[_points objectAtIndex:0] floatValue] - min + (delta / 1000)) * (self.bounds.size.height / delta);
    float baseLine = self.bounds.size.height;
    unsigned int integer = 0;

    CGContextRef context=UIGraphicsGetCurrentContext();

    NSScanner *scanner = [NSScanner scannerWithString:self.graphBackgroundColor];
    [scanner setCharactersToBeSkipped:[NSCharacterSet characterSetWithCharactersInString:@"#"]];
    [scanner scanHexInt:&integer];
    UIColor *color = [UIColor colorWithRed:((CGFloat) ((integer & 0xFF0000) >> 16))/255
                                             green:((CGFloat) ((integer & 0xFF00) >> 8))/255
                                              blue:((CGFloat) (integer & 0xFF))/255
                                             alpha:1];

    CGContextSetFillColorWithColor(context, color.CGColor);

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
    unsigned int integer = 0;
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetLineWidth(context, self.lineThickness / 4);

    NSScanner *scanner = [NSScanner scannerWithString:self.lineColor];
    [scanner setCharactersToBeSkipped:[NSCharacterSet characterSetWithCharactersInString:@"#"]];
    [scanner scanHexInt:&integer];
    UIColor *color = [UIColor colorWithRed:((CGFloat) ((integer & 0xFF0000) >> 16))/255
                                             green:((CGFloat) ((integer & 0xFF00) >> 8))/255
                                              blue:((CGFloat) (integer & 0xFF))/255
                                             alpha:1];
    CGContextSetStrokeColorWithColor(context, color.CGColor);

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

- (void)setSampleTime:(NSInteger *)sampleTime {
    _sampleTime = sampleTime;
    [self.delegate fibriCheckViewDidSetSampleTime];
}

- (void)setFlashEnabled:(BOOL)flashEnabled {
    _flashEnabled = flashEnabled;
    [self.delegate fibriCheckViewDidSetFlash];
}

- (void)setGravEnabled:(BOOL)gravEnabled {
    _gravEnabled = gravEnabled;
    [self.delegate fibriCheckViewDidSetGrav];
}

- (void)setGyroEnabled:(BOOL)gyroEnabled {
    _gyroEnabled = gyroEnabled;
    [self.delegate fibriCheckViewDidSetGyro];
}

- (void)setAccEnabled:(BOOL)accEnabled {
    _accEnabled = accEnabled;
    [self.delegate fibriCheckViewDidSetAcc];
}

- (void)setRotationEnabled:(BOOL)rotationEnabled {
    _rotationEnabled = rotationEnabled;
    [self.delegate fibriCheckViewDidSetRotation];
}

- (void)setMovementDetectionEnabled:(BOOL)movementDetectionEnabled {
    _movementDetectionEnabled = movementDetectionEnabled;
    [self.delegate fibriCheckViewDidSetMovementDetection];
}

- (void)setFingerDetectionExpiryTime:(NSInteger *)fingerDetectionExpiryTime {
    _fingerDetectionExpiryTime = fingerDetectionExpiryTime;
    [self.delegate fibriCheckViewDidSetFingerDetectionExpiryTime];
}

- (void)setWaitForStartRecordingSignal:(NSInteger *)waitForStartRecordingSignal {
    _waitForStartRecordingSignal = waitForStartRecordingSignal;
    [self.delegate fibriCheckViewDidSetWaitForStartRecordingSignal];
}

- (void)dealloc {
  self.points = nil;
}


@end
