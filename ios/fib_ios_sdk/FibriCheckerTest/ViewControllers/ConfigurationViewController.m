//
//  SettingsViewController.m
//  FibriCheckerTest
//
//  Created by Alain Hufkens on 15/01/2018.
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import "ConfigurationViewController.h"
#import "FibriChecker.h"

@interface ConfigurationViewController ()

@property (weak, nonatomic) IBOutlet UITextField *sampleTimeField;
@property (weak, nonatomic) IBOutlet UITextField *pulseExpiryTimeField;
@property (weak, nonatomic) IBOutlet UITextField *quadrantRowSizeField;
@property (weak, nonatomic) IBOutlet UITextField *quadrantColSizeField;

@property (weak, nonatomic) IBOutlet UISwitch *movementDetectionSwitch;
@property (weak, nonatomic) IBOutlet UITextField *movementDetectionUpperLimitField;
@property (weak, nonatomic) IBOutlet UITextField *movementDetectionLowerLimitField;
@property (weak, nonatomic) IBOutlet UISwitch *gyroSwitch;
@property (weak, nonatomic) IBOutlet UISwitch *accelerationSwitch;
@property (weak, nonatomic) IBOutlet UISwitch *rotationSwitch;
@property (weak, nonatomic) IBOutlet UISwitch *gravitySwitch;

@end

@implementation ConfigurationViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self updateView];
}

- (IBAction)handleDone:(id)sender {
    [self updateFibiChecker];
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)updateView {
    self.gyroSwitch.on = self.fibrichecker.gyroEnabled;
    self.accelerationSwitch.on = self.fibrichecker.accEnabled;
    self.rotationSwitch.on = self.fibrichecker.rotationEnabled;
    self.gravitySwitch.on = self.fibrichecker.gravEnabled;
    self.movementDetectionSwitch.on = self.fibrichecker.movementDetectionEnabled;
    self.movementDetectionLowerLimitField.text = [NSString stringWithFormat:@"%d", (int)self.fibrichecker.lowerMovementLimit];
    self.movementDetectionUpperLimitField.text = [NSString stringWithFormat:@"%d", (int)self.fibrichecker.upperMovementLimit];
    self.sampleTimeField.text = [NSString stringWithFormat:@"%d", (int)self.fibrichecker.sampleTime];
    self.pulseExpiryTimeField.text = [NSString stringWithFormat:@"%d", (int)self.fibrichecker.pulseDetectionExpiryTime];
    self.quadrantRowSizeField.text = [NSString stringWithFormat:@"%d", (int)self.fibrichecker.quadrantRows];
    self.quadrantColSizeField.text = [NSString stringWithFormat:@"%d", (int)self.fibrichecker.quadrantCols];
}

- (void)updateFibiChecker {
    self.fibrichecker.gyroEnabled = self.gyroSwitch.on;
    self.fibrichecker.accEnabled = self.accelerationSwitch.on;
    self.fibrichecker.rotationEnabled = self.rotationSwitch.on;
    self.fibrichecker.gravEnabled = self.gravitySwitch.on;
    self.fibrichecker.movementDetectionEnabled = self.movementDetectionSwitch.on;
    self.fibrichecker.lowerMovementLimit = [self.movementDetectionLowerLimitField.text integerValue];
    self.fibrichecker.upperMovementLimit = [self.movementDetectionUpperLimitField.text integerValue];
    self.fibrichecker.sampleTime = [self.sampleTimeField.text integerValue];
    self.fibrichecker.pulseDetectionExpiryTime = [self.pulseExpiryTimeField.text integerValue];
    self.fibrichecker.quadrantRows = [self.quadrantRowSizeField.text integerValue];
    self.fibrichecker.quadrantCols = [self.quadrantColSizeField.text integerValue];
}

@end
