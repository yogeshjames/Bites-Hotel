

"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Form = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotel/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // This ensures that cookies are sent and received
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('hotelId', result.hotelId);
        
        toast.success(result.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          theme: "light",
        });
console.log(result);
         router.push(`/dashboard/${result.hotelId}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Login Failed!", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    }
  };

  const handleSignUpClick = () => router.push('/register');

  if (!isMounted) return null;

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className='head'>Register Your Hotel with us 🌟</h1>

        <div className="flex-column">
          <label>Number</label>
        </div>
        <div className="inputForm">
          <PhoneIcon />
          <input
            type="tel"
            className="input"
            name="phone"
            placeholder="Enter Your Number"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="flex-column">
          <label>Password</label>
        </div>
        <div className="inputForm">
          <LockIcon />
          <input
            type="password"
            className="input"
            name="password"
            placeholder="Enter your Password"
            required
          />
        </div>

        <div className="flex-row">
          <span className="span">Forgot password?</span>
        </div>

        <button className="button-submit">Sign In</button>
        <p className="p">
          Don't have an account?{' '}
          <span className="span" onClick={handleSignUpClick}>Sign Up</span>
        </p>
      </form>
    </StyledWrapper>
  );
};

// Styled Components
const PhoneIcon = styled.svg.attrs({
  height: 20,
  width: 20,
  viewBox: "0 0 32 32",
  xmlns: "http://www.w3.org/2000/svg",
})`
  flex-shrink: 0;
`;

const LockIcon = styled.svg.attrs({
  height: 20,
  width: 20,
  viewBox: "-64 0 512 512",
  xmlns: "http://www.w3.org/2000/svg",
})`
  flex-shrink: 0;
`;

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 10px;

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #ffffff;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }

 .head {
    text-align: center;
    font-size: 2.5vw; /* Adjusts for mobile */
    padding-bottom: 5px;
    font-weight: 700;
    color: black;
  }

  ::placeholder {
    font-family: inherit;
  }

  .flex-column > label {
    color: #151717;
    font-weight: 600;
  }

  .inputForm {
    border: 1.5px solid #ecedec;
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    transition: 0.2s ease-in-out;
    width: 100%;
  }

  .input {
    margin-left: 10px;
    border-radius: 10px;
    border: none;
    width: 100%;
    height: 100%;
    color: black;
    font-size: 1rem;
    padding: 0 10px;
  }

  .input:focus {
    outline: none;
  }

  .inputForm:focus-within {
    border: 1.5px solid #2d79f3;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .flex-row > div > label {
    font-size: 0.9rem;
    color: black;
    font-weight: 400;
  }

  .span {
    font-size: 0.9rem;
    margin-left: 5px;
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
  }

  .button-submit {
    margin: 20px 0 10px 0;
    background-color: #151717;
    border: none;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 10px;
    height: 50px;
    width: 100%;
    cursor: pointer;
  }

  .button-submit:hover {
    background-color: #252727;
  }

  .p {
    text-align: center;
    color: black;
    font-size: 0.9rem;
    margin: 5px 0;
  }

  .btn {
    margin-top: 10px;
    width: 100%;
    height: 50px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    border: 1px solid #ededef;
    background-color: white;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  .btn:hover {
    border: 1px solid #2d79f3;
  }

  /* MOBILE RESPONSIVENESS */
  @media (max-width: 480px) {
    .form {
      padding: 1.5rem;
      width: 90%;
      max-width: 350px;
    }

    .head {
      font-size: 6vw;
    }

    .button-submit {
      height: 45px;
      font-size: 0.9rem;
    }

    .input {
      font-size: 0.9rem;
    }

    .span, .p, .flex-row > div > label {
      font-size: 0.8rem;
    }
  }
`;


export default Form;
