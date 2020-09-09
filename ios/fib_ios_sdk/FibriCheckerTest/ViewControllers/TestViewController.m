//
//  ViewController.m
//  FibriCheckerTest
//
//  Created by Alain Hufkens on 15/01/2018.
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import "TestViewController.h"
#import "FibriChecker.h"
#import "ConfigurationViewController.h"

@interface TestViewController ()

@property (nonatomic, strong) FibriChecker *fibrichecker;

@property (weak, nonatomic) IBOutlet UILabel *heartBeatLabel;
@property (weak, nonatomic) IBOutlet UILabel *measureStateLabel;
@property (weak, nonatomic) IBOutlet UILabel *timeRemainingLabel;
@property (weak, nonatomic) IBOutlet UILabel *eventsLabel;
@property (weak, nonatomic) IBOutlet UILabel *sampleLabel;

@end

@implementation TestViewController

- (void)viewDidLoad {
    [super viewDidLoad];    
    self.fibrichecker = [FibriChecker new];
    [self addListeners];
}

- (IBAction)handleStartStop:(UIButton*)sender {
    if (sender.selected) {
        [self resetView];
        [self.fibrichecker stop];
    } else {
        [self.fibrichecker startMeasurement];
    }
    sender.selected = !sender.selected;
}

- (void)resetView {
    self.measureStateLabel.text = @"--";
    self.timeRemainingLabel.text = @"--";
    self.heartBeatLabel.text = @"--";
    self.eventsLabel.text = @"Idle";
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([segue.identifier isEqualToString:@"SegueConfiguration"]) {
        UINavigationController * nc = segue.destinationViewController;
        ConfigurationViewController * vc = nc.childViewControllers.firstObject;
        vc.fibrichecker = self.fibrichecker;
    }
}

- (void)addListeners {
    NSLog(@"addListeners");
    
    __weak TestViewController *weakSelf = self;
    self.fibrichecker.onMeasurementStart = ^{
        weakSelf.measureStateLabel.text = @"Started";
        NSLog(@"onMeasurementStart");
    };
    
    self.fibrichecker.onMeasurementFinished = ^{
        weakSelf.measureStateLabel.text = @"Finished";
        NSLog(@"onMeasurementFinished");
    };
    
    self.fibrichecker.onMeasurementProcessed = ^(Measurement* measurement){
        weakSelf.measureStateLabel.text = @"Processed";
        NSLog(@"onMeasurementProcessed: %@", measurement);
    };
    
    self.fibrichecker.onSampleReady = ^(double ppg, double raw) {
        weakSelf.sampleLabel.text = [NSString stringWithFormat:@"ppg:%f raw:%f", (double)ppg, (double)raw];
    };
    
    self.fibrichecker.onFingerRemoved = ^{
        NSLog(@"onFingerRemoved");
        weakSelf.measureStateLabel.text = @"--";
        weakSelf.timeRemainingLabel.text = @"--";
        weakSelf.heartBeatLabel.text = @"--";
        weakSelf.eventsLabel.text = @"Finger Removed";
    };
    
    self.fibrichecker.onFingerDetected = ^{
        NSLog(@"onFingerDetected");
        weakSelf.measureStateLabel.text = @"Started";
        weakSelf.eventsLabel.text = @"Finger Detected";
    };
    
    self.fibrichecker.onMovementDetected = ^{
        NSLog(@"onMovementDetected");
        weakSelf.measureStateLabel.text = @"--";
        weakSelf.timeRemainingLabel.text = @"--";
        weakSelf.heartBeatLabel.text = @"--";
        weakSelf.eventsLabel.text = @"Movement";
    };
    
    self.fibrichecker.onPulseDetected = ^{
        weakSelf.eventsLabel.text = @"Pulse Found";
        weakSelf.measureStateLabel.text = @"Measuring...";
        NSLog(@"onPulseDetected");
    };
    
    self.fibrichecker.onPulseDetectionTimeExpired = ^{
        NSLog(@"onPulseDetectionTimeExpired");
    };
    
    self.fibrichecker.onHeartBeat = ^(NSUInteger value) {
        weakSelf.heartBeatLabel.text = [NSString stringWithFormat:@"%d", (int)value];
        NSLog(@"Heart Beat detected: %d", (int)value);
    };
    
    self.fibrichecker.onTimeRemaining = ^(NSUInteger seconds) {
        weakSelf.timeRemainingLabel.text = [NSString stringWithFormat:@"%d", (int)seconds];
        NSLog(@"Time remaining: %d", (int)seconds);
    };
}

@end
