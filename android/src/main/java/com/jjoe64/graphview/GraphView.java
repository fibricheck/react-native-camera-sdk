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

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PointF;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import com.jjoe64.graphview.series.BaseSeries;
import com.jjoe64.graphview.series.Series;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * @author jjoe64
 */
public class GraphView extends View {
    /**
     * Class to wrap style options that are general
     * to graphs.
     *
     * @author jjoe64
     */
    private static final class Styles {
        /**
         * The font size of the title that can be displayed
         * above the graph.
         *
         * @see GraphView#setTitle(String)
         */
        float titleTextSize;

        /**
         * The font color of the title that can be displayed
         * above the graph.
         *
         * @see GraphView#setTitle(String)
         */
        int titleColor;
    }

    /**
     * our series
     */
    private List<Series> mSeries;

    /**
     * viewport that holds the current bounds of
     * view.
     */
    private Viewport mViewport;

    /**
     * title of the graph that will be shown above
     */
    private String mTitle;

    /**
     * wraps the general styles
     */
    private Styles mStyles;

    /**
     * paint for the graph title
     */
    private Paint mPaintTitle;

    /**
     * paint for the preview (in the SDK)
     */
    private Paint mPreviewPaint;

    /**
     * Initialize the GraphView view
     * @param context
     */
    public GraphView(Context context) {
        super(context);
        init();
    }

    /**
     * Initialize the GraphView view.
     *
     * @param context
     * @param attrs
     */
    public GraphView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    /**
     * Initialize the GraphView view
     *
     * @param context
     * @param attrs
     * @param defStyle
     */
    public GraphView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    /**
     * initialize the internal objects.
     * This method has to be called directly
     * in the constructors.
     */
    protected void init() {
        mPreviewPaint = new Paint();
        mPreviewPaint.setTextAlign(Paint.Align.CENTER);
        mPreviewPaint.setColor(Color.BLACK);
        mPreviewPaint.setTextSize(50);

        mStyles = new Styles();
        mViewport = new Viewport(this);

        mSeries = new ArrayList<Series>();
        mPaintTitle = new Paint();

        loadStyles();
    }

    /**
     * loads the font
     */
    protected void loadStyles() {

    }

    /**
     * Add a new series to the graph. This will
     * automatically redraw the graph.
     * @param s the series to be added
     */
    public void addSeries(Series s) {
        s.onGraphViewAttached(this);
        mSeries.add(s);
        onDataChanged(false, false);
    }

    /**
     * important: do not do modifications on the list
     * object that will be returned.
     * Use {@link #removeSeries(com.jjoe64.graphview.series.Series)} and {@link #addSeries(com.jjoe64.graphview.series.Series)}
     *
     * @return all series
     */
    public List<Series> getSeries() {
        // TODO immutable array
        return mSeries;
    }

    /**
     * call this to let the graph redraw and
     * recalculate the viewport.
     * This will be called when a new series
     * was added or removed and when data
     * was appended via {@link com.jjoe64.graphview.series.BaseSeries#appendData(com.jjoe64.graphview.series.DataPointInterface, boolean, int)}
     * or {@link com.jjoe64.graphview.series.BaseSeries#resetData(com.jjoe64.graphview.series.DataPointInterface[])}.
     *
     * @param keepLabelsSize true if you don't want
     *                       to recalculate the size of
     *                       the labels. It is recommended
     *                       to use "true" because this will
     *                       improve performance and prevent
     *                       a flickering.
     * @param keepViewport true if you don't want that
     *                     the viewport will be recalculated.
     *                     It is recommended to use "true" for
     *                     performance.
     */
    public void onDataChanged(boolean keepLabelsSize, boolean keepViewport) {
        // adjustSteps grid system
        mViewport.calcCompleteRange();
        postInvalidate();
    }

    /**
     * draw all the stuff on canvas
     *
     * @param canvas
     */
    protected void drawGraphElements(Canvas canvas) {
        // must be in hardware accelerated mode
        if (!canvas.isHardwareAccelerated()) {
            // just warn about it, because it is ok when making a snapshot
            Log.w("GraphView", "GraphView should be used in hardware accelerated mode." +
                    "You can use android:hardwareAccelerated=\"true\" on your activity. Read this for more info:" +
                    "https://developer.android.com/guide/topics/graphics/hardware-accel.html");
        }

        for (Series s : mSeries) {
            s.draw(this, canvas, false);
        }
    }

    /**
     * will be called from Android system.
     *
     * @param canvas Canvas
     */
    @Override
    protected void onDraw(Canvas canvas) {
        if (isInEditMode()) {
            canvas.drawColor(Color.rgb(200, 200, 200));
            canvas.drawText("GraphView: No Preview available", canvas.getWidth()/2, canvas.getHeight()/2, mPreviewPaint);
        } else {
            drawGraphElements(canvas);
        }
    }

    /**
     * Calculates the height of the title.
     *
     * @return  the actual size of the title.
     *          if there is no title, 0 will be
     *          returned.
     */
    protected int getTitleHeight() {
        if (mTitle != null && mTitle.length()>0) {
            return (int) mPaintTitle.getTextSize();
        } else {
            return 0;
        }
    }

    /**
     * @return the viewport of the Graph.
     * @see com.jjoe64.graphview.Viewport
     */
    public Viewport getViewport() {
        return mViewport;
    }

    /**
     * Called by Android system if the size
     * of the view was changed. Will recalculate
     * the viewport and labels.
     *
     * @param w
     * @param h
     * @param oldw
     * @param oldh
     */
    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        onDataChanged(false, false);
    }

    /**
     * @return  the space on the left side of the
     *          view from the left border to the
     *          beginning of the graph viewport.
     */
    public int getGraphContentLeft() {
        return 0;
    }

    /**
     * @return  the space on the top of the
     *          view from the top border to the
     *          beginning of the graph viewport.
     */
    public int getGraphContentTop() {
        int border = getTitleHeight();
        return border;
    }

    /**
     * @return  the height of the graph viewport.
     */
    public int getGraphContentHeight() {
        int graphheight = getHeight() - getTitleHeight();
        return graphheight;
    }

    /**
     * @return  the width of the graph viewport.
     */
    public int getGraphContentWidth() {
        return getWidth();
    }

    /**
     *
     */
    @Override
    public void computeScroll() {
        super.computeScroll();
        mViewport.computeScroll();
    }

    /**
     * @return  the title that will be shown
     *          above the graph.
     */
    public String getTitle() {
        return mTitle;
    }

    /**
     * Set the title of the graph that will
     * be shown above the graph's viewport.
     *
     * @param mTitle the title
     * @see #setTitleColor(int) to set the font color
     * @see #setTitleTextSize(float) to set the font size
     */
    public void setTitle(String mTitle) {
        this.mTitle = mTitle;
    }

    /**
     * @return the title font size
     */
    public float getTitleTextSize() {
        return mStyles.titleTextSize;
    }

    /**
     * Set the title's font size
     *
     * @param titleTextSize font size
     * @see #setTitle(String)
     */
    public void setTitleTextSize(float titleTextSize) {
        mStyles.titleTextSize = titleTextSize;
    }

    /**
     * @return font color of the title
     */
    public int getTitleColor() {
        return mStyles.titleColor;
    }

    /**
     * Set the title's font color
     *
     * @param titleColor font color of the title
     * @see #setTitle(String)
     */
    public void setTitleColor(int titleColor) {
        mStyles.titleColor = titleColor;
    }

    /**
     * Removes all series of the graph.
     */
    public void removeAllSeries() {
        mSeries.clear();
        onDataChanged(false, false);
    }

    /**
     * Remove a specific series of the graph.
     * This will also re-draw the graph, but
     * without recalculating the viewport and
     * label sizes.
     * If you want this, you have to call {@link #onDataChanged(boolean, boolean)}
     * manually.
     *
     * @param series
     */
    public void removeSeries(Series<?> series) {
        mSeries.remove(series);
        onDataChanged(false, false);
    }
}
