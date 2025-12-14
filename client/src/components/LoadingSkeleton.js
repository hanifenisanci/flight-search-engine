import React from 'react';
import './LoadingSkeleton.css';

export const FlightCardSkeleton = () => (
  <div className="skeleton-flight-card">
    <div className="skeleton-flight-info">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text-short"></div>
    </div>
    <div className="skeleton-flight-price">
      <div className="skeleton-line skeleton-price"></div>
      <div className="skeleton-button"></div>
    </div>
  </div>
);

export const ArticleCardSkeleton = () => (
  <div className="skeleton-article-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-article-content">
      <div className="skeleton-badge"></div>
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text-short"></div>
    </div>
  </div>
);

export const NewsCardSkeleton = () => (
  <div className="skeleton-news-card">
    <div className="skeleton-image-large"></div>
    <div className="skeleton-news-content">
      <div className="skeleton-badge"></div>
      <div className="skeleton-line skeleton-title-large"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-date"></div>
        <div className="skeleton-line skeleton-link"></div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <div className="skeleton-profile-header">
      <div className="skeleton-circle"></div>
      <div className="skeleton-line skeleton-name"></div>
      <div className="skeleton-badge"></div>
    </div>
    <div className="skeleton-profile-section">
      <div className="skeleton-line skeleton-section-title"></div>
      <div className="skeleton-form">
        <div className="skeleton-input"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-input"></div>
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="skeleton-table">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="skeleton-table-row">
        {[...Array(columns)].map((_, j) => (
          <div key={j} className="skeleton-table-cell"></div>
        ))}
      </div>
    ))}
  </div>
);

export const GenericSkeleton = ({ width = '100%', height = '20px', className = '' }) => (
  <div 
    className={`skeleton-line ${className}`}
    style={{ width, height }}
  ></div>
);
