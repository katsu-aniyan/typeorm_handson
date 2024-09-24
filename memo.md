```sh
$ psql -h db -U postgres -d postgres
```

2024-09-24 TypeORMをやってみる

Getting Stargetd
https://typeorm.io/

dev containerで環境を構築した。
nodeとpostgreが入っているイメージを利用する。


code:sh
 $ psql -h db -U postgres -d postgres
 
 # winget で dbeaverを入れる
 winget install -e --id dbeaver.dbeaver

[*** トラシュー]
	postgresのドライバーインストールがエラーになる
		https://github.com/dbeaver/dbeaver/issues/34775
		これで対応「ウィンドウ -> 設定 -> 接続 -> Windows トラスト ストアの使用」のチェックを外す
		上記解決のために、wingetではuninstallしたが、関係なかった。


code:json
 	"forwardPorts": [3000, 5432]
devcontainer.jsonに上記を追加すると、ホストOSから接続できるようになった。

code:sh
 npm install typeorm
 npm install reflect-metadata
 npm install @types/node -D
 npm install pg


テンプレを使う
code:sh
 npx typeorm init --name MyProject --database postgres
 cd MyProject
 npm install
	npm start
これで、とりあえず、テンプレで生成された、index.tsのロジックが実装された

code:ts
 import { AppDataSource } from "./data-source"
 import { User } from "./entity/User"
 
 AppDataSource.initialize().then(async () => {
 
     console.log("Inserting a new user into the database...")
     const user = new User()
     user.firstName = "Timber"
     user.lastName = "Saw"
     user.age = 25
     await AppDataSource.manager.save(user)
     console.log("Saved a new user with id: " + user.id)
 
     console.log("Loading users from the database...")
     const users = await AppDataSource.manager.find(User)
     console.log("Loaded users: ", users)
 
     console.log("Here you can setup and run express / fastify / any other framework.")
 
 }).catch(error => console.log(error))
 

Repositoryとか使ってないのな、使い方が複数あるのかな。

[** TypeORMの2つの方式]
ActiveRecord方式とData Mapper方式がある。

	ActiveRecordはエンティティクラス自体がデータベース操作のロジックを持つ
		CRUD操作を行う
			`Create Read Upadate Delete`
		BaseEntityを継承する
	Data Mapper方式
		エンティティクラスは単純にデータモデルを表現する
		DB操作はRepositoryを通じて行う
	EntityManager
		複数のEntityを一元管理する
		トランザクション管理が容易になる


entitytManger
	AppDataSource.manager ← これがEntittyManager
	code:ts
	 await AppDataSource.transaction(async (entityManager) => {  entitytManager.save(x) })
	上記みたいな感じで、トランザクションを一つにする


カラム型
	サポートされている型
		https://typeorm.io/entities#column-types

code:ts
 // to initialize the initial connection with the database, register all entities
 // and "synchronize" database schema, call "initialize()" method of a newly created database
 // once in your application bootstrap
 AppDataSource.initialize()
     .then(() => {
         // here you can start to work with your database
     })
     .catch((error) => console.log(error))
これは、イニシャライズのコードだったのか。
あ、違うわ。initialize後に処理したよ、ということね。initializeでテーブルはできてるはず

data-source.ts
code:ts
 export const AppDataSource = new DataSource({
     type: "postgres",
     host: "localhost",
     port: 5432,
     username: "postgres",
     password: "postgres",
     database: "postgres",
     synchronize: true,
     logging: false,
     entities: [User], // entityを指定する必要がある
     migrations: [],
     subscribers: [],
 })

synchronize→ コードとDBが同期される

[** リポジトリの使用]
https://typeorm.io/#using-repositories
>エンティティを頻繁に処理する場合は、EntityManager よりもリポジトリを使用する方が便利です。

ほんまか。

リポジトリの詳細
https://typeorm.io/working-with-repository#
	EntityManagerに似ている
	リポジトリは特定のEntityの操作に制限される
	


code:ts
 
     @OneToOne(() => PersonalInfo, { cascade: true })
     @JoinColumn()
     personalInfo: PersonalInfo

code:ts
     const user = new User()
     user.firstName = "Timber"
     user.lastName = "Saw"
     user.age = 25
     user.personalInfo = new PersonalInfo()
     user.personalInfo.address = "chofu kokuryo"
cascade:trueだと、personalInfoテーブルにもインサートされる。

デフォルとだと、personalInfo.idがpersonalInfoIdとしてUserテーブルにinsされる

1対1の関係性を、相互に貼る
code:ts
	// PhotoMetaData側
    @OneToOne(() => Photo, (photo) => photo.metadata)
    @JoinColumn()
    photo: Photo
 
 // photo側
     @OneToOne(() => PhotoMetadata, (photoMetadata) => photoMetadata.photo)
     metadata: PhotoMetadata
`(photo) => photo.metadata` と `(photoMetadata) => photoMetadata.photo`の部分だと思う。
これで相互になっている。
ただし、MetaDataの方が主だから、JoinColumnはMetaDataの方についているのかな。
相互に貼らないと、metadataはphotoを知っているけど、photoはmetadataを知らないことになり、たどるのが難しくなる。

関数で指定しているのは、リファクタを容易にするめらしい。文字列でも指定できるみたい。

ESMプロジェクトにおいては、循環依存の回避のｔまえにRelation<Photo>のように型を指定するらしい。

relationsもfindするときは`findOne`を使って、`relations`オプジョンを指定する
code:ts
     const user = await userRepository.findOne( {
         where: { id: 2},
         relations: ["personalInfo"],
     })
findOneByのAPIではrelationsは指できないみたい


migrationまでやりたいな
と思ったけど、migrationまで行けなかったな。

https://typeorm.io/migrations
これだけど、ちょっとむずい？

code:sh
 npm run typeorm migration:generate -- hoge -d ./src/data-source.ts 

code:ts
 import { MigrationInterface, QueryRunner } from "typeorm";
 
 export class Hoge1727189025261 implements MigrationInterface {
     name = 'Hoge1727189025261'
 
     public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`ALTER TABLE "personal_info" ADD "fuga" integer NOT NULL`);
     }
 
     public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`ALTER TABLE "personal_info" DROP COLUMN "fuga"`);
     }
 
 }
 

datasoruceの接続先DBとの差分でマイグレーションファイルを作成するぽいな。

`migration:create` もあるけど、これなんだろう
