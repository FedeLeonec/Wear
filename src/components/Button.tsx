import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = 'primary'
}) => {
  const getColor = () => {
    switch(variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'info';
      case 'danger':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <MuiButton
      variant="contained"
      color={getColor()}
      style={style}
      onClick={onPress}
      disabled={disabled || loading}
      sx={{ 
        textTransform: 'none',
        borderRadius: '10px',
        padding: '10px 15px',
        margin: '10px 0',
        ...textStyle
      }}
    >
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        title
      )}
    </MuiButton>
  );
};

export default Button;