//
//  SettingsViewController.h
//  FibriCheckerTest
//
//  Created by Alain Hufkens on 15/01/2018.
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import <UIKit/UIKit.h>

@class FibriChecker;

@interface ConfigurationViewController : UITableViewController

@property (nonatomic, strong) FibriChecker *fibrichecker;

@end
