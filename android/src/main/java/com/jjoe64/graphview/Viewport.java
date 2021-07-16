/**
 * GraphView
 * Copyright 2016 Jonas Gehring
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.jjoe64.graphview;

import android.graphics.Color;
import android.graphics.Paint;
import androidx.core.view.ViewCompat;
import androidx.core.widget.EdgeEffectCompat;
import android.util.Log;
import android.view.ScaleGestureDetector;
import android.widget.OverScroller;

import com.jjoe64.graphview.series.DataPointInterface;
import com.jjoe64.graphview.series.Series;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * This is the default implementation for the viewport.
 * This implementation so for a normal viewport
 * where there is a horizontal x-axis and a
 * vertical y-axis.
 * This viewport is compatible with
 *  - {@link com.jjoe64.graphview.series.LineGraphSeries}
 *
 * @author jjoe64
 */
public class Viewport {
    /**
     * this reference value is used to generate the
     * vertical labels. It is used when the y axis bounds
     * is set manual and humanRoundingY=false. it will be the minValueY value.
     */
    protected double referenceY = Double.NaN;

    /**
     * this reference value is used to generate the
     * horizontal labels. It is used when the x axis bounds
     * is set manual and humanRoundingX=false. it will be the minValueX value.
     */
    protected double referenceX = Double.NaN;

    /**
     * flag whether the vertical scaling is activated
     */
    protected boolean scalableY;

    /**
     * minimal viewport used for scaling and scrolling.
     * this is used if the data that is available is
     * less then the viewport that we want to be able to display.
     *
     * Double.NaN to disable this value
     */
    private RectD mMinimalViewport = new RectD(Double.NaN, Double.NaN, Double.NaN, Double.NaN);

    /**
     * the reference number to generate the labels
     * @return  by default 0, only when manual bounds and no human rounding
     *          is active, the min x value is returned
     */
    protected double getReferenceX() {
        // if the bounds is manual then we take the
        // original manual min y value as reference
        if (isXAxisBoundsManual()) {
            if (Double.isNaN(referenceX)) {
                referenceX = getMinX(false);
            }
            return referenceX;
        } else {
            // starting from 0 so that the steps have nice numbers
            return 0;
        }
    }

    /**
     * listener to notify when x bounds changed after
     * scaling or scrolling.
     * This can be used to load more detailed data.
     */
    public interface OnXAxisBoundsChangedListener {
        /**
         * Called after scaling or scrolling with
         * the new bounds
         * @param minX min x value
         * @param maxX max x value
         */
        void onXAxisBoundsChanged(double minX, double maxX, OnXAxisBoundsChangedListener.Reason reason);

        public enum Reason {
            SCROLL, SCALE
        }
    }

    /**
     * listener for the scale gesture
     */
    private final ScaleGestureDetector.OnScaleGestureListener mScaleGestureListener
            = new ScaleGestureDetector.OnScaleGestureListener() {
        /**
         * called by android
         * @param detector detector
         * @return always true
         */
        @Override
        public boolean onScale(ScaleGestureDetector detector) {
            // --- horizontal scaling ---
            double viewportWidth = mCurrentViewport.width();

            if (mMaxXAxisSize != 0) {
                if (viewportWidth > mMaxXAxisSize) {
                    viewportWidth = mMaxXAxisSize;
                }
            }

            double center = mCurrentViewport.left + viewportWidth / 2;

            float scaleSpanX;
            if (android.os.Build.VERSION.SDK_INT >= 11 && scalableY) {
                scaleSpanX = detector.getCurrentSpanX()/detector.getPreviousSpanX();
            } else {
                scaleSpanX = detector.getScaleFactor();
            }

            viewportWidth /= scaleSpanX;
            mCurrentViewport.left = center - viewportWidth / 2;
            mCurrentViewport.right = mCurrentViewport.left+viewportWidth;

            // viewportStart must not be < minX
            double minX = getMinX(true);
            if (!Double.isNaN(mMinimalViewport.left)) {
                minX = Math.min(minX, mMinimalViewport.left);
            }
            if (mCurrentViewport.left < minX) {
                mCurrentViewport.left = minX;
                mCurrentViewport.right = mCurrentViewport.left+viewportWidth;
            }

            // viewportStart + viewportSize must not be > maxX
            double maxX = getMaxX(true);
            if (!Double.isNaN(mMinimalViewport.right)) {
                maxX = Math.max(maxX, mMinimalViewport.right);
            }
            if (viewportWidth == 0) {
                mCurrentViewport.right = maxX;
            }
            double overlap = mCurrentViewport.left + viewportWidth - maxX;
            if (overlap > 0) {
                // scroll left
                if (mCurrentViewport.left-overlap > minX) {
                    mCurrentViewport.left -= overlap;
                    mCurrentViewport.right = mCurrentViewport.left+viewportWidth;
                } else {
                    // maximal scale
                    mCurrentViewport.left = minX;
                    mCurrentViewport.right = maxX;
                }
            }


            // --- vertical scaling ---
            if (scalableY && detector.getCurrentSpanY() != 0f && detector.getPreviousSpanY() != 0f) {
                boolean hasSecondScale = false;

                double viewportHeight = mCurrentViewport.height()*-1;

                if (mMaxYAxisSize != 0) {
                    if (viewportHeight > mMaxYAxisSize) {
                        viewportHeight = mMaxYAxisSize;
                    }
                }

                center = mCurrentViewport.bottom + viewportHeight / 2;

                viewportHeight /= detector.getCurrentSpanY()/detector.getPreviousSpanY();
                mCurrentViewport.bottom = center - viewportHeight / 2;
                mCurrentViewport.top = mCurrentViewport.bottom+viewportHeight;

                // ignore bounds when second scale
                if (!hasSecondScale) {
                    // viewportStart must not be < minY
                    double minY = getMinY(true);
                    if (!Double.isNaN(mMinimalViewport.bottom)) {
                        minY = Math.min(minY, mMinimalViewport.bottom);
                    }
                    if (mCurrentViewport.bottom < minY) {
                        mCurrentViewport.bottom = minY;
                        mCurrentViewport.top = mCurrentViewport.bottom+viewportHeight;
                    }

                    // viewportStart + viewportSize must not be > maxY
                    double maxY = getMaxY(true);
                    if (!Double.isNaN(mMinimalViewport.top)) {
                        maxY = Math.max(maxY, mMinimalViewport.top);
                    }
                    if (viewportHeight == 0) {
                        mCurrentViewport.top = maxY;
                    }
                    overlap = mCurrentViewport.bottom + viewportHeight - maxY;
                    if (overlap > 0) {
                        // scroll left
                        if (mCurrentViewport.bottom-overlap > minY) {
                            mCurrentViewport.bottom -= overlap;
                            mCurrentViewport.top = mCurrentViewport.bottom+viewportHeight;
                        } else {
                            // maximal scale
                            mCurrentViewport.bottom = minY;
                            mCurrentViewport.top = maxY;
                        }
                    }
                }
            }

            // adjustSteps viewport, labels, etc.
            mGraphView.onDataChanged(true, false);

            ViewCompat.postInvalidateOnAnimation(mGraphView);

            return true;
        }

        /**
         * called when scaling begins
         *
         * @param detector detector
         * @return true if it is scalable
         */
        @Override
        public boolean onScaleBegin(ScaleGestureDetector detector) {
            if (mIsScalable) {
                mScalingActive = true;
                return true;
            } else {
                return false;
            }
        }

        /**
         * called when sacling ends
         * This will re-adjustSteps the viewport.
         *
         * @param detector detector
         */
        @Override
        public void onScaleEnd(ScaleGestureDetector detector) {
            mScalingActive = false;

            // notify
            if (mOnXAxisBoundsChangedListener != null) {
                mOnXAxisBoundsChangedListener.onXAxisBoundsChanged(getMinX(false), getMaxX(false), OnXAxisBoundsChangedListener.Reason.SCALE);
            }

            ViewCompat.postInvalidateOnAnimation(mGraphView);
        }
    };

    /**
     * the state of the axis bounds
     */
    public enum AxisBoundsStatus {
        /**
         * initial means that the bounds gets
         * auto adjusted if they are not manual.
         * After adjusting the status comes to
         * #AUTO_ADJUSTED.
         */
        INITIAL,

        /**
         * after the bounds got auto-adjusted,
         * this status will set.
         */
        AUTO_ADJUSTED,

        /**
         * means that the bounds are fix (manually) and
         * are not to be auto-adjusted.
         */
        FIX
    }

    /**
     * paint to draw background
     */
    private Paint mPaint;

    /**
     * reference to the graphview
     */
    private final GraphView mGraphView;

    /**
     * this holds the current visible viewport
     * left = minX, right = maxX
     * bottom = minY, top = maxY
     */
    protected RectD mCurrentViewport = new RectD();

    /**
     * maximum allowed viewport size (horizontal)
     * 0 means use the bounds of the actual data that is
     * available
     */
    protected double mMaxXAxisSize = 0;

    /**
     * maximum allowed viewport size (vertical)
     * 0 means use the bounds of the actual data that is
     * available
     */
    protected double mMaxYAxisSize = 0;

    /**
     * this holds the whole range of the data
     * left = minX, right = maxX
     * bottom = minY, top = maxY
     */
    protected RectD mCompleteRange = new RectD();

    /**
     * flag whether scaling is currently active
     */
    protected boolean mScalingActive;

    /**
     * flag whether the viewport is scrollable
     */
    private boolean mIsScrollable;

    /**
     * flag whether the viewport is scalable
     */
    private boolean mIsScalable;

    /**
     * detect scaling
     */
    protected ScaleGestureDetector mScaleGestureDetector;

    /**
     * not used - for fling
     */
    protected OverScroller mScroller;

    /**
     * not used
     */
    private EdgeEffectCompat mEdgeEffectTop;

    /**
     * not used
     */
    private EdgeEffectCompat mEdgeEffectBottom;

    /**
     * glow effect when scrolling left
     */
    private EdgeEffectCompat mEdgeEffectLeft;

    /**
     * glow effect when scrolling right
     */
    private EdgeEffectCompat mEdgeEffectRight;

    /**
     * state of the x axis
     */
    protected AxisBoundsStatus mXAxisBoundsStatus;

    /**
     * state of the y axis
     */
    protected AxisBoundsStatus mYAxisBoundsStatus;

    /**
     * flag whether the x axis bounds are manual
     */
    private boolean mXAxisBoundsManual;

    /**
     * flag whether the y axis bounds are manual
     */
    private boolean mYAxisBoundsManual;

    /**
     * background color of the viewport area
     * it is recommended to use a semi-transparent color
     */
    private int mBackgroundColor;

    /**
     * listener to notify when x bounds changed after
     * scaling or scrolling.
     * This can be used to load more detailed data.
     */
    protected OnXAxisBoundsChangedListener mOnXAxisBoundsChangedListener;

    /**
     * optional draw a border between the labels
     * and the viewport
     */
    private boolean mDrawBorder;

    /**
     * color of the border
     * @see #setDrawBorder(boolean)
     */
    private Integer mBorderColor;

    /**
     * custom paint to use for the border
     * @see #setDrawBorder(boolean)
     */
    private Paint mBorderPaint;

    /**
     * creates the viewport
     *
     * @param graphView graphview
     */
    Viewport(GraphView graphView) {
        mScroller = new OverScroller(graphView.getContext());
        mEdgeEffectTop = new EdgeEffectCompat(graphView.getContext());
        mEdgeEffectBottom = new EdgeEffectCompat(graphView.getContext());
        mEdgeEffectLeft = new EdgeEffectCompat(graphView.getContext());
        mEdgeEffectRight = new EdgeEffectCompat(graphView.getContext());
        mScaleGestureDetector = new ScaleGestureDetector(graphView.getContext(), mScaleGestureListener);

        mGraphView = graphView;
        mXAxisBoundsStatus = AxisBoundsStatus.INITIAL;
        mYAxisBoundsStatus = AxisBoundsStatus.INITIAL;
        mBackgroundColor = Color.TRANSPARENT;
        mPaint = new Paint();
    }

    /**
     * change the state of the x axis.
     * normally you do not call this method.
     * If you want to set manual axis use
     * {@link #setXAxisBoundsManual(boolean)} and {@link #setYAxisBoundsManual(boolean)}
     *
     * @param s state
     */
    public void setXAxisBoundsStatus(AxisBoundsStatus s) {
        mXAxisBoundsStatus = s;
    }

    /**
     * change the state of the y axis.
     * normally you do not call this method.
     * If you want to set manual axis use
     * {@link #setXAxisBoundsManual(boolean)} and {@link #setYAxisBoundsManual(boolean)}
     *
     * @param s state
     */
    public void setYAxisBoundsStatus(AxisBoundsStatus s) {
        mYAxisBoundsStatus = s;
    }

    /**
     * @return whether the viewport is scrollable
     */
    public boolean isScrollable() {
        return mIsScrollable;
    }

    /**
     * @param mIsScrollable whether is viewport is scrollable
     */
    public void setScrollable(boolean mIsScrollable) {
        this.mIsScrollable = mIsScrollable;
    }

    /**
     * @return the x axis state
     */
    public AxisBoundsStatus getXAxisBoundsStatus() {
        return mXAxisBoundsStatus;
    }

    /**
     * @return the y axis state
     */
    public AxisBoundsStatus getYAxisBoundsStatus() {
        return mYAxisBoundsStatus;
    }

    /**
     * caches the complete range (minX, maxX, minY, maxY)
     * by iterating all series and all datapoints and
     * stores it into #mCompleteRange
     *
     * for the x-range it will respect the series on the
     * second scale - not for y-values
     */
    public void calcCompleteRange() {
        List<Series> series = mGraphView.getSeries();
        List<Series> seriesInclusiveSecondScale = new ArrayList<>(mGraphView.getSeries());

        mCompleteRange.set(0d, 0d, 0d, 0d);
        if (!seriesInclusiveSecondScale.isEmpty() && !seriesInclusiveSecondScale.get(0).isEmpty()) {
            double d = seriesInclusiveSecondScale.get(0).getLowestValueX();
            for (Series s : seriesInclusiveSecondScale) {
                if (!s.isEmpty() && d > s.getLowestValueX()) {
                    d = s.getLowestValueX();
                }
            }
            mCompleteRange.left = d;

            d = seriesInclusiveSecondScale.get(0).getHighestValueX();
            for (Series s : seriesInclusiveSecondScale) {
                if (!s.isEmpty() && d < s.getHighestValueX()) {
                    d = s.getHighestValueX();
                }
            }
            mCompleteRange.right = d;

            if (!series.isEmpty() && !series.get(0).isEmpty()) {
                d = series.get(0).getLowestValueY();
                for (Series s : series) {
                    if (!s.isEmpty() && d > s.getLowestValueY()) {
                        d = s.getLowestValueY();
                    }
                }
                mCompleteRange.bottom = d;

                d = series.get(0).getHighestValueY();
                for (Series s : series) {
                    if (!s.isEmpty() && d < s.getHighestValueY()) {
                        d = s.getHighestValueY();
                    }
                }
                mCompleteRange.top = d;
            }
        }

        // calc current viewport bounds
        if (mYAxisBoundsStatus == AxisBoundsStatus.AUTO_ADJUSTED) {
            mYAxisBoundsStatus = AxisBoundsStatus.INITIAL;
        }
        if (mYAxisBoundsStatus == AxisBoundsStatus.INITIAL) {
            mCurrentViewport.top = mCompleteRange.top;
            mCurrentViewport.bottom = mCompleteRange.bottom;
        }

        if (mXAxisBoundsStatus == AxisBoundsStatus.AUTO_ADJUSTED) {
            mXAxisBoundsStatus = AxisBoundsStatus.INITIAL;
        }
        if (mXAxisBoundsStatus == AxisBoundsStatus.INITIAL) {
            mCurrentViewport.left = mCompleteRange.left;
            mCurrentViewport.right = mCompleteRange.right;
        } else if (mXAxisBoundsManual && !mYAxisBoundsManual && mCompleteRange.width() != 0) {
            // get highest/lowest of current viewport
            // lowest
            double d = Double.MAX_VALUE;
            for (Series s : series) {
                Iterator<DataPointInterface> values = s.getValues(mCurrentViewport.left, mCurrentViewport.right);
                while (values.hasNext()) {
                    double v = values.next().getY();
                    if (d > v) {
                        d = v;
                    }
                }
            }

            if (d != Double.MAX_VALUE) {
                mCurrentViewport.bottom = d;
            }

            // highest
            d = Double.MIN_VALUE;
            for (Series s : series) {
                Iterator<DataPointInterface> values = s.getValues(mCurrentViewport.left, mCurrentViewport.right);
                while (values.hasNext()) {
                    double v = values.next().getY();
                    if (d < v) {
                        d = v;
                    }
                }
            }

            if (d != Double.MIN_VALUE) {
                mCurrentViewport.top = d;
            }
        }

        // fixes blank screen when range is zero
        if (mCurrentViewport.left == mCurrentViewport.right) mCurrentViewport.right++;
        if (mCurrentViewport.top == mCurrentViewport.bottom) mCurrentViewport.top++;
    }

    /**
     * @param completeRange     if true => minX of the complete range of all series
     *                          if false => minX of the current visible viewport
     * @return the min x value
     */
    public double getMinX(boolean completeRange) {
        if (completeRange) {
            return mCompleteRange.left;
        } else {
            return mCurrentViewport.left;
        }
    }

    /**
     * @param completeRange     if true => maxX of the complete range of all series
     *                          if false => maxX of the current visible viewport
     * @return the max x value
     */
    public double getMaxX(boolean completeRange) {
        if (completeRange) {
            return mCompleteRange.right;
        } else {
            return mCurrentViewport.right;
        }
    }

    /**
     * @param completeRange     if true => minY of the complete range of all series
     *                          if false => minY of the current visible viewport
     * @return the min y value
     */
    public double getMinY(boolean completeRange) {
        if (completeRange) {
            return mCompleteRange.bottom;
        } else {
            return mCurrentViewport.bottom;
        }
    }

    /**
     * @param completeRange     if true => maxY of the complete range of all series
     *                          if false => maxY of the current visible viewport
     * @return the max y value
     */
    public double getMaxY(boolean completeRange) {
        if (completeRange) {
            return mCompleteRange.top;
        } else {
            return mCurrentViewport.top;
        }
    }

    /**
     * set the maximal y value for the current viewport.
     * Make sure to set the y bounds to manual via
     * {@link #setYAxisBoundsManual(boolean)}
     * @param y max / highest value
     */
    public void setMaxY(double y) {
        mCurrentViewport.top = y;
    }

    /**
     * set the minimal y value for the current viewport.
     * Make sure to set the y bounds to manual via
     * {@link #setYAxisBoundsManual(boolean)}
     * @param y min / lowest value
     */
    public void setMinY(double y) {
        mCurrentViewport.bottom = y;
    }

    /**
     * set the maximal x value for the current viewport.
     * Make sure to set the x bounds to manual via
     * {@link #setXAxisBoundsManual(boolean)}
     * @param x max / highest value
     */
    public void setMaxX(double x) {
        mCurrentViewport.right = x;
    }

    /**
     * set the minimal x value for the current viewport.
     * Make sure to set the x bounds to manual via
     * {@link #setXAxisBoundsManual(boolean)}
     * @param x min / lowest value
     */
    public void setMinX(double x) {
        mCurrentViewport.left = x;
    }

    /**
     * release the glowing effects
     */
    private void releaseEdgeEffects() {
        mEdgeEffectLeft.onRelease();
        mEdgeEffectRight.onRelease();
        mEdgeEffectTop.onRelease();
        mEdgeEffectBottom.onRelease();
    }

    /**
     * not used currently
     */
    public void computeScroll() {
    }

    /**
     * @return background of the viewport area
     */
    public int getBackgroundColor() {
        return mBackgroundColor;
    }

    /**
     * @param mBackgroundColor  background of the viewport area
     *                          use transparent to have no background
     */
    public void setBackgroundColor(int mBackgroundColor) {
        this.mBackgroundColor = mBackgroundColor;
    }

    /**
     * @return whether the viewport is scalable
     */
    public boolean isScalable() {
        return mIsScalable;
    }

    /**
     * active the scaling/zooming feature
     * notice: sets the x axis bounds to manual
     *
     * @param mIsScalable whether the viewport is scalable
     */
    public void setScalable(boolean mIsScalable) {
        this.mIsScalable = mIsScalable;
        if (mIsScalable) {
            mIsScrollable = true;

            // set viewport to manual
            setXAxisBoundsManual(true);
        }

    }

    /**
     * @return whether the x axis bounds are manual.
     * @see #setMinX(double)
     * @see #setMaxX(double)
     */
    public boolean isXAxisBoundsManual() {
        return mXAxisBoundsManual;
    }

    /**
     * @param mXAxisBoundsManual whether the x axis bounds are manual.
     * @see #setMinX(double)
     * @see #setMaxX(double)
     */
    public void setXAxisBoundsManual(boolean mXAxisBoundsManual) {
        this.mXAxisBoundsManual = mXAxisBoundsManual;
        if (mXAxisBoundsManual) {
            mXAxisBoundsStatus = AxisBoundsStatus.FIX;
        }
    }

    /**
     * @return whether the y axis bound are manual
     */
    public boolean isYAxisBoundsManual() {
        return mYAxisBoundsManual;
    }

    /**
     * @param mYAxisBoundsManual whether the y axis bounds are manual
     * @see #setMaxY(double)
     * @see #setMinY(double)
     */
    public void setYAxisBoundsManual(boolean mYAxisBoundsManual) {
        this.mYAxisBoundsManual = mYAxisBoundsManual;
        if (mYAxisBoundsManual) {
            mYAxisBoundsStatus = AxisBoundsStatus.FIX;
        }
    }

    /**
     * forces the viewport to scroll to the end
     * of the range by keeping the current viewport size.
     *
     * Important: Only takes effect if x axis bounds are manual.
     *
     * @see #setXAxisBoundsManual(boolean)
     */
    public void scrollToEnd() {
        if (mXAxisBoundsManual) {
            double size = mCurrentViewport.width();
            mCurrentViewport.right = mCompleteRange.right;
            mCurrentViewport.left = mCompleteRange.right - size;
            mGraphView.onDataChanged(true, false);
        } else {
            Log.w("GraphView", "scrollToEnd works only with manual x axis bounds");
        }
    }

    /**
     * @return the listener when there is one registered.
     */
    public OnXAxisBoundsChangedListener getOnXAxisBoundsChangedListener() {
        return mOnXAxisBoundsChangedListener;
    }

    /**
     * set a listener to notify when x bounds changed after
     * scaling or scrolling.
     * This can be used to load more detailed data.
     *
     * @param l the listener to use
     */
    public void setOnXAxisBoundsChangedListener(OnXAxisBoundsChangedListener l) {
        mOnXAxisBoundsChangedListener = l;
    }

    /**
     * optional draw a border between the labels
     * and the viewport
     *
     * @param drawBorder true to draw the border
     */
    public void setDrawBorder(boolean drawBorder) {
        this.mDrawBorder = drawBorder;
    }

    /**
     * the border color used. will be ignored when
     * a custom paint is set.
     *
     * @see #setDrawBorder(boolean)
     * @return border color. by default the grid color is used
     */
    public int getBorderColor() {
        return mBorderColor;
    }

    /**
     * the border color used. will be ignored when
     * a custom paint is set.
     *
     * @param borderColor null to reset
     */
    public void setBorderColor(Integer borderColor) {
        this.mBorderColor = borderColor;
    }

    /**
     * custom paint to use for the border. border color
     * will be ignored
     *
     * @see #setDrawBorder(boolean)
     * @param borderPaint
     */
    public void setBorderPaint(Paint borderPaint) {
        this.mBorderPaint = borderPaint;
    }

    /**
     * the reference number to generate the labels
     * @return  by default 0, only when manual bounds and no human rounding
     *          is active, the min y value is returned
     */
    protected double getReferenceY() {
        // if the bounds is manual then we take the
        // original manual min y value as reference
        if (isYAxisBoundsManual()) {
            if (Double.isNaN(referenceY)) {
                referenceY = getMinY(false);
            }
            return referenceY;
        } else {
            // starting from 0 so that the steps have nice numbers
            return 0;
        }
    }

    /**
     * activate or deactivate the vertical zooming/scaling functionallity.
     * This will automatically activate the vertical scrolling and the
     * horizontal scaling/scrolling feature.
     *
     * @param scalableY true to activate
     */
    public void setScalableY(boolean scalableY) {
        if (scalableY) {
            setScalable(true);
        }
        this.scalableY = scalableY;
    }

    /**
     * maximum allowed viewport size (horizontal)
     * 0 means use the bounds of the actual data that is
     * available
     */
    public double getMaxXAxisSize() {
        return mMaxXAxisSize;
    }

    /**
     * maximum allowed viewport size (vertical)
     * 0 means use the bounds of the actual data that is
     * available
     */
    public double getMaxYAxisSize() {
        return mMaxYAxisSize;
    }

    /**
     * Set the max viewport size (horizontal)
     * This can prevent the user from zooming out too much. E.g. with a 24 hours graph, it
     * could force the user to only be able to see 2 hours of data at a time.
     * Default value is 0 (disabled)
     *
     * @param mMaxXAxisViewportSize maximum size of viewport
     */
    public void setMaxXAxisSize(double mMaxXAxisViewportSize) {
        this.mMaxXAxisSize = mMaxXAxisViewportSize;
    }

    /**
     * Set the max viewport size (vertical)
     * This can prevent the user from zooming out too much. E.g. with a 24 hours graph, it
     * could force the user to only be able to see 2 hours of data at a time.
     * Default value is 0 (disabled)
     *
     * @param mMaxYAxisViewportSize maximum size of viewport
     */
    public void setMaxYAxisSize(double mMaxYAxisViewportSize) {
        this.mMaxYAxisSize = mMaxYAxisViewportSize;
    }

    /**
     * minimal viewport used for scaling and scrolling.
     * this is used if the data that is available is
     * less then the viewport that we want to be able to display.
     *
     * if Double.NaN is used, then this value is ignored
     *
     * @param minX
     * @param maxX
     * @param minY
     * @param maxY
     */
    public void setMinimalViewport(double minX, double maxX, double minY, double maxY) {
       mMinimalViewport.set(minX, maxY, maxX, minY);
    }
}
