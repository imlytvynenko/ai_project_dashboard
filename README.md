# RewardOps Analytics POC Dashboard

A proof-of-concept analytics dashboard for RewardOps with real-time data processing capabilities, natural language query interface, and dynamic visualization generation.

## Demo

https://github.com/user-attachments/assets/28f16154-7314-420a-980a-e98574dedab8

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   PostgreSQL    │
│                 │    │                 │    │    Database     │
│  • TypeScript   │◄──►│  • ReAct Agent  │◄──►│  pangea_dev     │
│  • WebSocket    │    │  • Natural Lang │    │  • orders       │
│  • Chart.js     │    │  • SQL Gen      │    │  • members      │
│  • Tailwind     │    │  • MCP Clients  │    │  • programs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        └───────────────────────┘
            WebSocket/HTTP API
```

### Technology Stack

**Frontend (React + TypeScript)**
- **React 18**: Modern UI framework with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Chart.js**: Dynamic data visualization
- **WebSocket**: Real-time communication

**Backend (FastAPI + Python)**
- **FastAPI**: High-performance async web framework
- **ReAct Agent**: Reasoning + Acting pattern for query processing
- **psycopg2**: Direct PostgreSQL connectivity
- **WebSocket**: Real-time bidirectional communication
- **Pydantic**: Data validation and serialization

**Database**
- **PostgreSQL**: `pangea_development` database
- **Tables**: orders, members, programs
- **Direct Connection**: psycopg2-binary for optimal performance

## 🧠 ReAct Agent Architecture

The core intelligence of the system is powered by a **ReAct (Reasoning + Acting) Agent** that processes natural language queries and converts them into dynamic SQL operations.

### ReAct Agent Flow

```
┌─────────────────┐
│ Natural Language │
│ Query Input     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 1. REASON       │
│ Analyze Intent  │
│ • Entities      │
│ • Aggregations  │
│ • Filters       │
│ • Actions       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 2. ACT          │
│ Generate SQL    │
│ • Dynamic Query │
│ • Table Join    │
│ • Field Select  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 3. EXECUTE      │
│ Database Query  │
│ • Real Data     │
│ • Error Handle  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 4. FORMAT       │
│ Response Gen    │
│ • Charts        │
│ • Natural Text  │
│ • UI Components │
└─────────────────┘
```

### Key Features

#### 🎯 Dynamic Query Processing
- **No Hardcoded Responses**: Agent generates SQL dynamically based on user intent
- **Context Awareness**: Maintains session context for follow-up queries
- **Flexible Entities**: Handles orders, members, programs, and their relationships

#### 🗣️ Natural Language Interface
```python
# Example queries the system handles:
"Show me the last 3 orders with their payment status"
"How many active programs do we have?"
"List all members from New York"
"What is the total revenue from orders this month?"
```

#### 📊 Intelligent Visualization
- **Auto-Chart Generation**: Determines optimal chart types based on data
- **Responsive UI**: Adapts to different data shapes and sizes
- **Real-time Updates**: WebSocket-powered live data streaming

## 🚀 Development Journey

### Phase 1: Initial Setup
- ✅ FastAPI backend structure
- ✅ React frontend with TypeScript
- ✅ Mock data integration
- ✅ Basic query interface

### Phase 2: Real Database Integration
- ✅ **Challenge**: MCP tools not accessible from standalone Python
- ✅ **Solution**: Direct PostgreSQL connection with psycopg2
- ✅ Real-time data from `pangea_development` database
- ✅ Dynamic SQL generation

### Phase 3: ReAct Agent Implementation
- ✅ **Challenge**: Fixed order-based responses
- ✅ **Solution**: Dynamic natural language processing
- ✅ Intent analysis and SQL generation
- ✅ Context-aware query handling

### Phase 4: Testing & Validation
- ✅ Comprehensive test suite (6/6 tests passing)
- ✅ API endpoint testing
- ✅ ReAct agent functionality validation
- ✅ Database integration verification

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL (pangea_development database)
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn psycopg2-binary websockets pydantic

# Run the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Database Configuration

Ensure PostgreSQL is running with the `pangea_development` database:

```sql
-- Required tables: orders, members, programs
-- Connection: localhost:5432/pangea_development
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Analytics Query
```http
POST /api/query
Content-Type: application/json

{
  "query": "Show me total revenue",
  "session_id": "unique-session-id"
}
```

### WebSocket Connection
```javascript
ws://localhost:8000/ws/{session_id}

// Message format
{
  "type": "query",
  "query": "Your natural language query"
}
```

### Session Status
```http
GET /api/sessions/{session_id}/status
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

**Test Coverage:**
- ✅ API endpoints (health, query, session status)
- ✅ ReAct agent initialization
- ✅ Natural language query analysis
- ✅ Complete query processing with real data

### Test Results
```
6/6 tests PASSED (100% success rate)
```

## 🗃️ Database Schema

### Orders Table
```sql
- id: Primary key
- external_id: External identifier
- created_at: Timestamp
- payment_status: PENDING/COMPLETE/FAILED
- fulfillment_status: PENDING/COMPLETE
```

### Members Table
```sql
- id: Primary key
- name: Member name
- location: Geographic data
- status: ACTIVE/INACTIVE
```

### Programs Table
```sql
- id: Primary key
- name: Program name
- status: ACTIVE/INACTIVE
- type: Program classification
```

## 🔄 Real-time Features

### WebSocket Communication
- **Bidirectional**: Client ↔ Server real-time messaging
- **Session Management**: Multi-user support with session isolation
- **Status Updates**: Live query processing feedback
- **Error Handling**: Graceful error communication

### Live Data Processing
```javascript
// WebSocket message types
{
  "type": "status",    // Processing updates
  "type": "result",    // Query results
  "type": "error"      // Error messages
}
```

## 🎨 UI Components

### Chat Interface
- Real-time conversation flow
- Query input with suggestions
- Response rendering with charts
- Message history management

### Visualization Engine
- **Chart Types**: Bar, line, pie, doughnut
- **Dynamic Generation**: Based on data characteristics
- **Responsive Design**: Mobile and desktop optimized
- **Interactive Elements**: Hover states, click events

## 🚨 Error Handling

### Backend Error Management
- **Database Connection**: Automatic retry logic
- **Query Validation**: SQL injection prevention
- **Session Handling**: Graceful WebSocket disconnection
- **Response Formatting**: Consistent error structures

### Frontend Error Boundaries
- **Network Errors**: Connection retry mechanisms
- **Data Validation**: Type checking and validation
- **User Feedback**: Clear error messaging
- **Fallback UI**: Graceful degradation

## 🔐 Security Considerations

### CORS Configuration
```python
allow_origins=["http://localhost:3000"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

### Database Security
- Direct PostgreSQL connection with proper credentials
- SQL injection prevention through parameterized queries
- Connection pooling for optimal resource management

## 📈 Performance Optimization

### Backend Optimizations
- **Async FastAPI**: High-concurrency request handling
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Dynamic SQL with proper indexing
- **Memory Management**: Efficient data processing

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive renders
- **WebSocket Efficiency**: Optimized real-time communication
- **Bundle Optimization**: Webpack optimization strategies

## 🔮 Future Enhancements

### Planned Features
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Multi-tenant Support**: Organization-level isolation
- [ ] **Caching Layer**: Redis for improved performance
- [ ] **Export Functionality**: PDF/Excel report generation
- [ ] **Advanced Visualizations**: 3D charts, geographic maps
- [ ] **AI Suggestions**: Query recommendations based on history

### Scalability Roadmap
- [ ] **Microservices**: Service decomposition
- [ ] **Container Deployment**: Docker + Kubernetes
- [ ] **Load Balancing**: Horizontal scaling capabilities
- [ ] **Monitoring**: Application performance monitoring
- [ ] **CI/CD Pipeline**: Automated testing and deployment

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript/Python best practices
2. **Testing**: Maintain 100% test coverage for critical paths
3. **Documentation**: Update README for any architectural changes
4. **Commit Messages**: Use conventional commit format

### Project Structure
```
ai_pangea_dashboard/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── react_agent.py      # Core ReAct logic
│   │   │   └── mcp_clients.py      # Database clients
│   │   └── main.py                 # FastAPI application
│   ├── tests/                      # Test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── services/               # API clients
│   │   └── types/                  # TypeScript definitions
│   └── package.json
└── README.md
```

## 📄 License

This project is a proof-of-concept developed for RewardOps analytics capabilities.

## 📞 Support

For questions about architecture, implementation, or extending the system, please refer to the codebase documentation and test suites for examples of proper usage patterns.

---

**Built with ❤️ using FastAPI, React, and the power of ReAct agents for intelligent data processing.**
