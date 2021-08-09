//
//  FCSGFilter.h
//  FibriCheckerComponent
//
//  Copyright © 2018 Qompium NV. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface FCSGFilter : NSObject

@property NSMutableArray * shiftRegister;

-(float)calculateValue:(float)input;

@end
