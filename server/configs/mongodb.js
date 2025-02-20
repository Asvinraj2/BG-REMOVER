import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/bg_remover`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
        console.log("Database Connected:", conn.connection.host)
    } catch (error) {
        console.error("Database connection failed:", error)
        process.exit(1)
    }
}

export default connectDB

// import mongoose from 'mongoose'

// const connectDB = async () => {

//     mongoose.connection.on('connected', ()=> {
//         console.log("Database Connected");
        
//     })

// await mongoose.connect(`${process.env.MONGODB_URI}/bg_remover`)

// }

// export default connectDB