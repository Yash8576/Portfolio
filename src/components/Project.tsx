import React from "react";
import mock01 from '../assets/images/mock01.png';
import mock02 from '../assets/images/mock02.png';
import '../assets/styles/Project.scss';

function Project() {
    return(
    <div className="projects-container" id="projects">
        <h1>Projects</h1>
        <div className="projects-grid">
            <div className="project">
                <a href="https://github.com/Yash8576/BuzzCart" target="_blank" rel="noreferrer"><img src={mock01} className="zoom" alt="thumbnail" width="100%"/></a>
                <a href="https://github.com/Yash8576/BuzzCart" target="_blank" rel="noreferrer"><h2>BuzzCart (Like2Buy)</h2></a>
                <p>Production-grade social commerce platform with Flutter frontend and Go backend, featuring video reels, shopping integration, and 20+ RESTful APIs. Architected microservices backend using Go/Gin framework, PostgreSQL, MongoDB, and MinIO S3-compatible storage, all containerized with Docker & Kubernetes. Built RAG-powered chatbot service using FastAPI with ChromaDB vector database and OpenAI integration, supporting multiple document formats and maintaining conversation history.</p>
            </div>
            <div className="project">
                <a href="https://github.com/Yash8576/RideShareApp" target="_blank" rel="noreferrer"><img src={mock02} className="zoom" alt="thumbnail" width="100%"/></a>
                <a href="https://github.com/Yash8576/RideShareApp" target="_blank" rel="noreferrer"><h2>RideShare App</h2></a>
                <p>Engineered ride-sharing Android application using Java with real-time location tracking, automated ride matching, secure payment integration, and driver-passenger communication. Established Firebase Authentication for secure user management and Firestore for distributed data storage. Leveraged Google Maps API achieving 95% location accuracy and optimized routing. Managed version control using Git workflows with branching and pull requests, resolving 20+ merge conflicts across 50+ commits.</p>
            </div>
        </div>
    </div>
    );
}

export default Project;