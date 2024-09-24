import { AppDataSource } from "./data-source";
import { PersonalInfo } from "./entity/PersionalInfo";
import { User } from "./entity/User";

AppDataSource.initialize().then(async () => {
    console.log("initialized")

    const userRepository = AppDataSource.getRepository(User);
    // const user  = await userRepository.findOneBy({
    //     id : 2
    // })
    const user = await userRepository.findOne( {
        where: { id: 2},
        relations: ["personalInfo"],
    })
    console.log("before",user);

    // user.firstName = "fuga";
    // await userRepository.save(user);
    // const user2  = await userRepository.findOneBy({
    //     id : 1
    // })
    // console.log("after",user2);

    // console.log("remove")
    // await userRepository.remove(user2);

    // const user3  = await userRepository.findOneBy({
    //     id : 1
    // })
    // console.log("after",user3);

    // execByEntityManager();
    // execByRepository();
}).catch(error => console.log(error))


const execByEntityManager = async () => {
    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    user.personalInfo = new PersonalInfo()
    user.personalInfo.address = "chofu kokuryo"

    const entytyManager = AppDataSource.manager;

    await entytyManager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await entytyManager.find(User) // all Users
    console.log("Loaded users: ", users)

    console.log("fin")

}

const execByRepository = async () => {
    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25

    const userRepository = AppDataSource.getRepository(User);

    await userRepository.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await userRepository.find() // all Users entityManager.findと違って、Entityを指定する必要がないな
    console.log("Loaded users: ", users)

    console.log("fin")

}
